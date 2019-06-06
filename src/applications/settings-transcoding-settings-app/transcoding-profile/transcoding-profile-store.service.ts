import { Host, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';
import { VidiunClient, VidiunMultiRequest, VidiunObjectBaseFactory } from 'vidiun-ngx-client';
import { TranscodingProfileWidgetsManager } from './transcoding-profile-widgets-manager';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { PageExitVerificationService } from 'app-shared/vmc-shell/page-exit-verification';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VidiunConversionProfileFilter } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { VidiunConversionProfileAssetParamsFilter } from 'vidiun-ngx-client';
import { ConversionProfileAssetParamsListAction } from 'vidiun-ngx-client';
import {
  BaseTranscodingProfilesStore,
  VidiunConversionProfileWithAsset
} from '../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';
import { ConversionProfileGetAction } from 'vidiun-ngx-client';
import { VidiunConversionProfile } from 'vidiun-ngx-client';
import { TranscodingProfileCreationService } from 'app-shared/vmc-shared/events/transcoding-profile-creation';
import { OnDataSavingReasons } from '@vidiun-ng/vidiun-ui';
import { ConversionProfileAddAction } from 'vidiun-ngx-client';
import { ConversionProfileUpdateAction } from 'vidiun-ngx-client';
import { MediaTranscodingProfilesStore } from '../transcoding-profiles/transcoding-profiles-store/media-transcoding-profiles-store.service';
import { LiveTranscodingProfilesStore } from '../transcoding-profiles/transcoding-profiles-store/live-transcoding-profiles-store.service';
import { VidiunConversionProfileType } from 'vidiun-ngx-client';
import {
    SettingsTranscodingProfileViewSections,
    SettingsTranscodingProfileViewService
} from 'app-shared/vmc-shared/vmc-views/details-views';
import { SettingsTranscodingMainViewService } from 'app-shared/vmc-shared/vmc-views/main-views/settings-transcoding-main-view.service';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { TranscodingProfilesUpdatedEvent } from 'app-shared/vmc-shared/events';
import { AppEventsService } from 'app-shared/vmc-shared';

export enum ActionTypes {
  ProfileLoading,
  ProfileLoaded,
  ProfileLoadingFailed,
  ProfileSaving,
  ProfilePrepareSavingFailed,
  ProfileSavingFailed,
  ProfileDataIsInvalid,
  ActiveSectionBusy
}
export enum NotificationTypes {
    ViewEntered
}
export interface StatusArgs {
  action: ActionTypes;
  error?: Error;
}

@Injectable()
export class TranscodingProfileStore implements OnDestroy {
    private _notifications = new Subject<{ type: NotificationTypes, error?: Error }>();
    public notifications$ = this._notifications.asObservable();
  private _profilesStore: BaseTranscodingProfilesStore;
  private _loadProfileSubscription: ISubscription;
  private _pageExitVerificationToken: string;
  private _saveProfileInvoked = false;
  private _profile = {
    data: new BehaviorSubject<VidiunConversionProfileWithAsset>(null),
    state: new BehaviorSubject<StatusArgs>({ action: ActionTypes.ProfileLoading, error: null })
  };
  private _profileId: string;
  private _profileIsDirty: boolean;

  public get profileIsDirty(): boolean {
    return this._profileIsDirty;
  }

  public get profileId(): string {
    return String(this._profileId);
  }

  public readonly profile = {
    data$: this._profile.data.asObservable(),
    state$: this._profile.state.asObservable(),
    data: () => this._profile.data.value
  };

  constructor(@Host() private _widgetsManager: TranscodingProfileWidgetsManager,
              private _vidiunServerClient: VidiunClient,
              private _router: Router,
              private _appEvents: AppEventsService,
              private _browserService: BrowserService,
              private _profileRoute: ActivatedRoute,
              private _pageExitVerificationService: PageExitVerificationService,
              private _appLocalization: AppLocalization,
              private _profileCreationService: TranscodingProfileCreationService,
              private _mediaTranscodingProfilesStore: MediaTranscodingProfilesStore,
              private _liveTranscodingProfilesStore: LiveTranscodingProfilesStore,
              private _settingsTranscodingProfileViewService: SettingsTranscodingProfileViewService,
              private _settingsTranscodingMainViewService: SettingsTranscodingMainViewService,
              private _logger: VidiunLogger) {


    this._widgetsManager.profileStore = this;
    this._onSectionsStateChanges();
    this._onRouterEvents();
  }

  private _onSectionsStateChanges(): void {
    this._widgetsManager.widgetsState$
      .pipe(cancelOnDestroy(this))
      .debounce(() => Observable.timer(500))
      .subscribe(
        sectionsState => {
          const newDirtyState = Object
            .keys(sectionsState)
            .reduce((result, sectionName) => result || sectionsState[sectionName].isDirty, false);

          if (this._profileIsDirty !== newDirtyState) {
            this._logger.info(`update profile is dirty state to ${newDirtyState}`);
            this._profileIsDirty = newDirtyState;

            this._updatePageExitVerification();

          }
        }
      );
  }

  private _updatePageExitVerification(): void {
    if (this._profileIsDirty) {
      this._pageExitVerificationToken = this._pageExitVerificationService.add();
    } else {
      if (this._pageExitVerificationToken) {
        this._pageExitVerificationService.remove(this._pageExitVerificationToken);
      }
      this._pageExitVerificationToken = null;
    }
  }

  ngOnDestroy() {
    if (this._loadProfileSubscription) {
      this._loadProfileSubscription.unsubscribe();
    }

    this._profile.data.complete();
    this._profile.state.complete();

    if (this._pageExitVerificationToken) {
      this._pageExitVerificationService.remove(this._pageExitVerificationToken);
    }

    if (this._saveProfileInvoked && this._profilesStore) {
      this._profilesStore.reload();
    }
  }

  private _setProfilesStoreServiceByType(serviceType: VidiunConversionProfileType): void {
    if (serviceType === VidiunConversionProfileType.media) {
      this._profilesStore = this._mediaTranscodingProfilesStore;
    } else if (serviceType === VidiunConversionProfileType.liveStream) {
      this._profilesStore = this._liveTranscodingProfilesStore;
    } else {
      throw Error('Incorrect serviceType provided. It can be either VidiunConversionProfileType.media or VidiunConversionProfileType.liveStream type');
    }
  }

  private _onRouterEvents(): void {
    this._router.events
      .pipe(cancelOnDestroy(this))
      .subscribe(
        event => {
          if (event instanceof NavigationEnd) {
            const currentProfileId = this._profileRoute.snapshot.params.id;
            if (currentProfileId !== this._profileId) {
              if (currentProfileId === 'new') {
                const newData = this._profileCreationService.popNewProfileData();
                if (newData) {
                  this._profileId = currentProfileId;
                  this._setProfilesStoreServiceByType(newData.profile.type);
                    const newProfile = newData.profile;
                    (<any>newProfile).id = 'new';
                  this._profile.data.next(newData.profile);

                  setTimeout(() => {
                    const profileLoadedResult = this._widgetsManager.notifyDataLoaded(this.profile.data(), { isNewData: true });
                    if (profileLoadedResult.errors.length) {
                      this._profile.state.next({
                        action: ActionTypes.ProfileLoadingFailed,
                        error: new Error('one of the widgets failed while handling data loaded event')
                      });
                    } else {
                      this._profile.state.next({ action: ActionTypes.ProfileLoaded });
                    }
                  }, 0);
                } else {
                    this._settingsTranscodingMainViewService.open();
                }
              } else {

                // we must defer the loadProfile to the next event cycle loop to allow components
                // to init them-selves when entering this module directly.
                setTimeout(() => {
                  const profile = this.profile.data();
                  if (!profile || (profile && profile.id !== currentProfileId)) {
                    this._loadProfile(currentProfileId);
                  }
                });
              }
            } else {
                this._notifications.next({ type: NotificationTypes.ViewEntered });
            }
          }
        }
      );
  }

  private _checkFlavors(newProfile: VidiunConversionProfileWithAsset): Observable<{ proceedSave: boolean }> {
    if (newProfile.flavorParamsIds && newProfile.flavorParamsIds.trim().length) {
      return Observable.of({ proceedSave: true });
    }

    return Observable.create(observer => {
      this._browserService.confirm({
        message: this._appLocalization.get('applications.settings.transcoding.flavors.noFlavorsSelectedWarning'),
        accept: () => {
          observer.next({ proceedSave: true });
          observer.complete();
        },
        reject: () => {
          observer.next({ proceedSave: false });
          observer.complete();
        }
      });
    });
  }

  private _transmitSaveRequest(newProfile: VidiunConversionProfileWithAsset): void {
    this._profile.state.next({ action: ActionTypes.ProfileSaving });

    const id = this.profileId;
    const action = id === 'new'
      ? new ConversionProfileAddAction({ conversionProfile: newProfile })
      : new ConversionProfileUpdateAction({ id: Number(id), conversionProfile: newProfile });
    const request = new VidiunMultiRequest(action);

    this._widgetsManager.notifyDataSaving(newProfile, request, this.profile.data())
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .flatMap(prepareResponse => {
        if (prepareResponse.ready) {
          return this._checkFlavors(newProfile)
            .switchMap(({ proceedSave }) => {
              if (!proceedSave) {
                return Observable.empty();
              }

              return this._vidiunServerClient.multiRequest(request)
                .pipe(tag('block-shell'))
                .map(multiResponse => {
                  if (multiResponse.hasErrors()) {
                    const errorMessage = multiResponse.map(response => {
                      if (response.error) {
                        return response.error.message + '\n';
                      }
                    }).join('');
                    this._profile.state.next({ action: ActionTypes.ProfileSavingFailed, error: new Error(errorMessage) });
                  } else {
                    const isNew = id === 'new';
                    const [profileResponse] = multiResponse;

                    this._saveProfileInvoked = true;

                    if (isNew) {
                      this._profileIsDirty = false;
                        this._appEvents.publish(new TranscodingProfilesUpdatedEvent());
                        this._settingsTranscodingProfileViewService.open({ profile: profileResponse.result, section: SettingsTranscodingProfileViewSections.Metadata });
                    } else {
                      this._loadProfile(profileResponse.result.id);
                    }
                  }

                  return Observable.empty();
                });
            });
        } else {
          switch (prepareResponse.reason) {
            case OnDataSavingReasons.validationErrors:
              this._profile.state.next({ action: ActionTypes.ProfileDataIsInvalid });
              break;
            case OnDataSavingReasons.attachedWidgetBusy:
              this._profile.state.next({ action: ActionTypes.ActiveSectionBusy });
              break;
            case OnDataSavingReasons.buildRequestFailure:
              this._profile.state.next({ action: ActionTypes.ProfilePrepareSavingFailed });
              break;
          }

          return Observable.empty();
        }
      })
      .subscribe(
        response => {
          // do nothing - the service state is modified inside the map functions.
        },
        error => {
          // should not reach here, this is a fallback plan.
          this._profile.state.next({ action: ActionTypes.ProfileSavingFailed, error });
        }
      );
  }

  public saveProfile(): void {
      const profile = this.profile.data();
      const newProfile = <VidiunConversionProfileWithAsset>VidiunObjectBaseFactory.createObject(profile);
      if (newProfile && newProfile instanceof VidiunConversionProfile) {
          if (this.profileId === 'new') {
              newProfile.type = profile.type;
          }

          newProfile.flavorParamsIds = profile.flavorParamsIds; // this field is provided always to allow flavor section to modify it as needed with new/removed flavors

          this._transmitSaveRequest(newProfile);
      } else {
          console.error(new Error(`Failed to create a new instance of the profile type '${this.profile ? typeof this.profile : 'n/a'}`));
          this._profile.state.next({action: ActionTypes.ProfilePrepareSavingFailed});
      }
  }

  public reloadProfile(): void {
    if (this.profileId) {
      this._loadProfile(this.profileId);
    }
  }

  private _loadProfile(profileId: string): void {
    if (this._loadProfileSubscription) {
      this._loadProfileSubscription.unsubscribe();
      this._loadProfileSubscription = null;
    }

    this._profileId = profileId;
    this._profileIsDirty = false;
    this._updatePageExitVerification();

    this._profile.state.next({ action: ActionTypes.ProfileLoading });
    this._widgetsManager.notifyDataLoading(profileId);

    this._loadProfileSubscription = this._getProfile(profileId)
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
            this._profile.data.next(response);
            this._profileId = String(response.id);
            this._notifications.next({ type: NotificationTypes.ViewEntered });

            if (this._settingsTranscodingProfileViewService.isAvailable({
                profile: response,
                activatedRoute: this._profileRoute,
                section: SettingsTranscodingProfileViewSections.ResolveFromActivatedRoute
            })) {
                this._setProfilesStoreServiceByType(response.type);

                const dataLoadedResult = this._widgetsManager.notifyDataLoaded(response, { isNewData: false });
                if (dataLoadedResult.errors.length) {
                    this._profile.state.next({
                        action: ActionTypes.ProfileLoadingFailed,
                        error: new Error(`one of the widgets failed while handling data loaded event`)
                    });
                } else {
                    this._profile.state.next({ action: ActionTypes.ProfileLoaded });
                }
            }
        },
        error => {
          this._profile.state.next({ action: ActionTypes.ProfileLoadingFailed, error });

        }
      );
  }

  public openSection(sectionKey: SettingsTranscodingProfileViewSections): void {
     this._settingsTranscodingProfileViewService.open({ section: sectionKey, profile: this.profile.data() });
  }

  private _getProfile(profileId: string): Observable<VidiunConversionProfileWithAsset> {
    if (profileId) {
      const id = Number(profileId);
      const conversionProfileAction = new ConversionProfileGetAction({ id });
      const conversionProfileAssetParamsAction = new ConversionProfileAssetParamsListAction({
        filter: new VidiunConversionProfileAssetParamsFilter({
          conversionProfileIdFilter: new VidiunConversionProfileFilter({ idEqual: id })
        }),
        pager: new VidiunFilterPager({ pageSize: 1000 })
      });

      // build the request
      return this._vidiunServerClient
        .multiRequest(new VidiunMultiRequest(conversionProfileAction, conversionProfileAssetParamsAction))
        .map(([profilesResponse, assetsResponse]) => {
          if (profilesResponse.error) {
            throw Error(profilesResponse.error.message);
          }

          if (assetsResponse.error) {
            throw Error(assetsResponse.error.message);
          }

          const profile = profilesResponse.result;
          const assets = assetsResponse.result.objects;
          const flavorParamsIds = (profile.flavorParamsIds || '').trim();
          const flavors = flavorParamsIds ? flavorParamsIds.split(',').length : 0;
          return Object.assign(profile, { assets, flavors });
        });
    } else {
      return Observable.throw(new Error('missing profileId'));
    }
  }

  public openProfile(profile: VidiunConversionProfileWithAsset): void {
    this.canLeave()
        .filter(({ allowed }) => allowed)
        .pipe(cancelOnDestroy(this))
        .subscribe(() => {
            this._settingsTranscodingProfileViewService.open({ profile, section: SettingsTranscodingProfileViewSections.Metadata });
        });
  }

  public canLeave(): Observable<{ allowed: boolean }> {
    return Observable.create(observer => {
      if (this._profileIsDirty) {
        this._browserService.confirm(
          {
            header: this._appLocalization.get('applications.settings.transcoding.cancelEdit'),
            message: this._appLocalization.get('applications.settings.transcoding.discard'),
            accept: () => {
              this._profileIsDirty = false;
              observer.next({ allowed: true });
              observer.complete();
            },
            reject: () => {
              observer.next({ allowed: false });
              observer.complete();
            }
          }
        );
      } else {
        observer.next({ allowed: true });
        observer.complete();
      }
    });
  }

  public returnToProfiles(): void {
      this._settingsTranscodingMainViewService.open();
  }
}

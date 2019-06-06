import { Injectable, OnDestroy } from '@angular/core';
import { VidiunAPIException, VidiunClient, VidiunMultiRequest, VidiunObjectBaseFactory } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { EntryWidget } from '../entry-widget';
import { Observable } from 'rxjs';
import { DistributionProfileListAction } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { EntryDistributionListAction } from 'vidiun-ngx-client';
import { VidiunEntryDistributionFilter } from 'vidiun-ngx-client';
import { FlavorAssetGetFlavorAssetsWithParamsAction } from 'vidiun-ngx-client';
import { ThumbAssetGetByEntryIdAction } from 'vidiun-ngx-client';
import { VidiunDistributionProfileListResponse } from 'vidiun-ngx-client';
import { VidiunDistributionProfileStatus } from 'vidiun-ngx-client';
import { VidiunEntryDistributionListResponse } from 'vidiun-ngx-client';
import { VidiunEntryDistributionStatus } from 'vidiun-ngx-client';
import { VidiunFlavorAssetWithParams } from 'vidiun-ngx-client';
import { VidiunLiveParams } from 'vidiun-ngx-client';
import { Flavor } from '../entry-flavours/flavor';
import { VidiunFlavorAssetStatus } from 'vidiun-ngx-client';
import { VidiunWidevineFlavorAsset } from 'vidiun-ngx-client';
import { VidiunThumbAsset } from 'vidiun-ngx-client';
import { VidiunEntryDistribution } from 'vidiun-ngx-client';
import { VidiunDistributionProfile } from 'vidiun-ngx-client';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryDistributionSubmitDeleteAction } from 'vidiun-ngx-client';
import { EntryDistributionDeleteAction } from 'vidiun-ngx-client';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { BrowserService } from 'app-shared/vmc-shell';
import { VidiunRequest } from 'vidiun-ngx-client';
import { VidiunDistributionProfileActionStatus } from 'vidiun-ngx-client';
import { FlavorParamsGetAction } from 'vidiun-ngx-client';
import { EntryDistributionAddAction } from 'vidiun-ngx-client';
import { EntryDistributionSubmitAddAction } from 'vidiun-ngx-client';
import { EntryDistributionUpdateAction } from 'vidiun-ngx-client';
import { EntryDistributionSubmitUpdateAction } from 'vidiun-ngx-client';
import { EntryDistributionRetrySubmitAction } from 'vidiun-ngx-client';
import { VidiunDistributionProviderType } from 'vidiun-ngx-client';
import { ContentEntryViewSections } from 'app-shared/vmc-shared/vmc-views/details-views/content-entry-view.service';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export interface ExtendedVidiunEntryDistribution extends VidiunEntryDistribution {
  name: string;
  autoDistribution: boolean;
}

export interface DistributionWidgetData {
  distributedProfiles: ExtendedVidiunEntryDistribution[],
  undistributedProfiles: VidiunDistributionProfile[],
  partnerDistributionProfiles: VidiunDistributionProfile[],
  flavors: Flavor[];
  thumbnails: VidiunThumbAsset[];
}

@Injectable()
export class EntryDistributionWidget extends EntryWidget implements OnDestroy {
  private _partnerDistributionProfiles = new BehaviorSubject<{ items: VidiunDistributionProfile[] }>({ items: [] });
  private _distributedProfiles = new BehaviorSubject<{ items: VidiunEntryDistribution[] }>({ items: [] });
  private _undistributedProfiles = new BehaviorSubject<{ items: VidiunDistributionProfile[] }>({ items: [] });
  private _flavors = new BehaviorSubject<{ items: Flavor[] }>({ items: [] });
  private _thumbnails = new BehaviorSubject<{ items: VidiunThumbAsset[] }>({ items: [] });

  public popupMessage: AreaBlockerMessage;
  public flavors$ = this._flavors.asObservable();
  public thumbnails$ = this._thumbnails.asObservable();
  public distributionProfiles$ = {
    distributed: this._distributedProfiles.asObservable(),
    undistributed: this._undistributedProfiles.asObservable()
  };

  constructor(private _appLocalization: AppLocalization,
              private _vidiunClient: VidiunClient,
              private _browserService: BrowserService,
              logger: VidiunLogger) {
    super(ContentEntryViewSections.Distribution, logger);
  }

  ngOnDestroy() {

  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset() {
    this._flavors.next({ items: [] });
    this._thumbnails.next({ items: [] });
    this._distributedProfiles.next({ items: [] });
    this._partnerDistributionProfiles.next({ items: [] });
    this._undistributedProfiles.next({ items: [] });
  }

  protected onActivate(firstTimeActivating: boolean): Observable<{ failed: boolean, error?: Error }> {
    super._showLoader();

    return this._loadDistributionData()
      .do((response: DistributionWidgetData) => {
        this._flavors.next({ items: response.flavors });
        this._thumbnails.next({ items: response.thumbnails });
        this._distributedProfiles.next({ items: response.distributedProfiles });
        this._undistributedProfiles.next({ items: response.undistributedProfiles });
        this._partnerDistributionProfiles.next({ items: response.partnerDistributionProfiles });

        super._hideLoader();
      })
      .map(() => ({ failed: false }))
      .catch(error => {
          super._hideLoader();
          super._showActivationError();
          return Observable.of({ failed: true, error });
        }
      );
  }

  protected onDataSaving(data: VidiunMediaEntry, request: VidiunMultiRequest): void {

  }

  private _mapPartnerDistributionResponse(response: VidiunDistributionProfileListResponse): VidiunDistributionProfile[] {
    if (!response || !Array.isArray(response.objects)) {
      return [];
    }
    return response.objects.filter(profile => profile.status === VidiunDistributionProfileStatus.enabled);
  }

  private _mapEntryDistributionResponse(response: VidiunEntryDistributionListResponse): VidiunEntryDistribution[] {
    if (!response || !Array.isArray(response.objects)) {
      return [];
    }
    return response.objects.filter(profile => profile.status !== VidiunEntryDistributionStatus.deleted);
  }

  private _mapEntryFlavorsResponse(response: VidiunFlavorAssetWithParams[]): Flavor[] {
    let flavors = [];
    if (response && response.length) {
      const flavorsWithAssets = [];
      const flavorsWithoutAssets = [];
      response.forEach((flavor: VidiunFlavorAssetWithParams) => {
        if (flavor.flavorAsset && flavor.flavorAsset.isOriginal) {
          flavors.push(this._createFlavor(flavor, response)); // this is the source. put it first in the array
        } else if (flavor.flavorAsset && (!flavor.flavorAsset.status ||
            (flavor.flavorAsset.status && flavor.flavorAsset.status.toString() !== VidiunFlavorAssetStatus.temp.toString()))) {
          flavorsWithAssets.push(this._createFlavor(flavor, response)); // flavors with assets that is not in temp status
        } else if (!flavor.flavorAsset && flavor.flavorParams && !(flavor.flavorParams instanceof VidiunLiveParams)) {
          flavorsWithoutAssets.push(this._createFlavor(flavor, response)); // flavors without assets
        }
      });
      // source first, then flavors with assets, then flavors without assets
      flavors = flavors.concat(flavorsWithAssets).concat(flavorsWithoutAssets);
    }

    return flavors;
  }

  private _createFlavor(flavor: VidiunFlavorAssetWithParams, allFlavors: VidiunFlavorAssetWithParams[]): Flavor {
    const newFlavor = <Flavor>flavor;
    newFlavor.name = flavor.flavorParams ? flavor.flavorParams.name : '';
    newFlavor.id = flavor.flavorAsset ? flavor.flavorAsset.id : '';
    newFlavor.paramsId = flavor.flavorParams.id;
    newFlavor.isSource = flavor.flavorAsset ? flavor.flavorAsset.isOriginal : false;
    newFlavor.isWidevine = flavor.flavorAsset ? flavor.flavorAsset instanceof VidiunWidevineFlavorAsset : false;
    newFlavor.isWeb = flavor.flavorAsset ? flavor.flavorAsset.isWeb : false;
    newFlavor.format = flavor.flavorAsset ? flavor.flavorAsset.fileExt : '';
    newFlavor.codec = flavor.flavorAsset ? flavor.flavorAsset.videoCodecId : '';
    newFlavor.bitrate = (flavor.flavorAsset && flavor.flavorAsset.bitrate && flavor.flavorAsset.bitrate > 0)
      ? flavor.flavorAsset.bitrate.toString()
      : '';
    newFlavor.size = flavor.flavorAsset ? (flavor.flavorAsset.status.toString() === VidiunFlavorAssetStatus.ready.toString()
      ? flavor.flavorAsset.size.toString() : '0')
      : '';
    newFlavor.status = flavor.flavorAsset ? flavor.flavorAsset.status.toString() : '';
    newFlavor.statusLabel = '';
    newFlavor.statusTooltip = '';
    newFlavor.tags = flavor.flavorAsset ? flavor.flavorAsset.tags : '-';
    newFlavor.drm = {};

    // set dimensions
    const width: number = flavor.flavorAsset ? flavor.flavorAsset.width : flavor.flavorParams.width;
    const height: number = flavor.flavorAsset ? flavor.flavorAsset.height : flavor.flavorParams.height;
    const w: string = width === 0 ? '[auto]' : width.toString();
    const h: string = height === 0 ? '[auto]' : height.toString();
    newFlavor.dimensions = w + ' x ' + h;

    // set status
    if (flavor.flavorAsset) {
      newFlavor.statusLabel = this._appLocalization.get(
        'applications.content.entryDetails.flavours.status.' + VidiunFlavorAssetStatus[flavor.flavorAsset.status]
      );
      if (flavor.flavorAsset.status.toString() === VidiunFlavorAssetStatus.notApplicable.toString()) {
        newFlavor.statusTooltip = this._appLocalization.get('applications.content.entryDetails.flavours.status.naTooltip');
      }
    }

    // add DRM details
    if (newFlavor.isWidevine) {
      // get source flavors for DRM
      const sourceIDs = (flavor.flavorAsset as VidiunWidevineFlavorAsset).actualSourceAssetParamsIds
        ? (flavor.flavorAsset as VidiunWidevineFlavorAsset).actualSourceAssetParamsIds.split(',')
        : [];
      const sources = [];
      sourceIDs.forEach(sourceId => {
        allFlavors.forEach(flavorItem => {
          if (flavorItem.flavorParams.id.toString() === sourceId) {
            sources.push(flavorItem.flavorParams.name);
          }
        });
      });
      // set start and end date
      let startDate = (flavor.flavorAsset as VidiunWidevineFlavorAsset).widevineDistributionStartDate;
      if (startDate === -2147483648 || startDate === 18001 || startDate === 2000001600) {
        startDate = null;
      }
      let endDate = (flavor.flavorAsset as VidiunWidevineFlavorAsset).widevineDistributionEndDate;
      if (endDate === -2147483648 || endDate === 18001 || endDate === 2000001600) {
        endDate = null;
      }
      newFlavor.drm = {
        name: flavor.flavorParams.name,
        id: (flavor.flavorAsset as VidiunWidevineFlavorAsset).widevineAssetId,
        flavorSources: sources,
        startTime: startDate,
        endTime: endDate
      };
    }
    return newFlavor;
  }

  private _mapThumbnailsResponse(response: VidiunThumbAsset[]): VidiunThumbAsset[] {
    if (response && response.length) {
      return response;
    }
    return [];
  }

  private _loadDistributionData(): Observable<DistributionWidgetData> {
    const partnerDistributionListAction = new DistributionProfileListAction({
      pager: new VidiunFilterPager({ pageSize: 500 })
    });

    const entryDistributionListAction = new EntryDistributionListAction({
      filter: new VidiunEntryDistributionFilter({ entryIdEqual: this.data.id })
    });

    const entryFlavorsListAction = new FlavorAssetGetFlavorAssetsWithParamsAction({ entryId: this.data.id });

    const entryThumbnailsListAction = new ThumbAssetGetByEntryIdAction({ entryId: this.data.id });

    return this._vidiunClient
      .multiRequest(new VidiunMultiRequest(
        partnerDistributionListAction,
        entryDistributionListAction,
        entryFlavorsListAction,
        entryThumbnailsListAction
      ))
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .map(response => {
        if (response.hasErrors()) {
          response.forEach(item => {
            if (item.error) {
              throw Error(item.error.message);
            }
          });
        }

        const [partnerDistribution, entryDistribution, entryFlavors, entryThumbnails] = response;
        const flavors = this._mapEntryFlavorsResponse(entryFlavors.result);
        const thumbnails = this._mapThumbnailsResponse(entryThumbnails.result);
        const partnerDistributionProfiles = this._mapPartnerDistributionResponse(partnerDistribution.result);
        const undistributedProfiles = [...partnerDistributionProfiles];
        const entryProfiles = this._mapEntryDistributionResponse(entryDistribution.result);
        const distributedProfiles = [];

        entryProfiles.forEach((profile) => {
          const relevantPartnerProfile = undistributedProfiles.find(({ id }) => id === profile.distributionProfileId);
          if (relevantPartnerProfile) {
            const autoDistribution = relevantPartnerProfile.submitEnabled === VidiunDistributionProfileActionStatus.automatic ||
              profile.status === VidiunEntryDistributionStatus.queued;
            const distributedProfile = <ExtendedVidiunEntryDistribution>Object.assign(
              VidiunObjectBaseFactory.createObject(profile),
              profile,
              {
                autoDistribution,
                name: relevantPartnerProfile.name
              }
            );
            distributedProfiles.push(distributedProfile);
            undistributedProfiles.splice(undistributedProfiles.indexOf(relevantPartnerProfile), 1);
          }
        });

        return {
          flavors,
          thumbnails,
          distributedProfiles,
          undistributedProfiles,
          partnerDistributionProfiles
        };
      });
  }

  private _performDeleteRequest(action: VidiunRequest<VidiunEntryDistribution | void>, closePopupCallback?: () => void): void {
    this._vidiunClient.request(action)
      .pipe(tag('block-shell'))
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .subscribe(
        () => {
          if (typeof closePopupCallback === 'function') {
            closePopupCallback();
          }
          this.refresh();
          this._browserService.scrollToTop();
        },
        error => {
          this._showBlockerMessage(new AreaBlockerMessage({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.cannotDelete'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.ok'),
                action: () => {
                  if (typeof closePopupCallback === 'function') {
                    closePopupCallback();
                  }
                  this.refresh();
                  this._browserService.scrollToTop();
                }
              }
            ]
          }), false);
        }
      );
  }

  public setDirty(): void {
    super.updateState({ isDirty: true });
  }

  public getProviderName(type: VidiunDistributionProviderType): string {
    switch (true) {
      case type === VidiunDistributionProviderType.attUverse:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type === VidiunDistributionProviderType.avn:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.avn');

      case type === VidiunDistributionProviderType.comcastMrss:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.comcastMrss');

      case type === VidiunDistributionProviderType.crossVidiun:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.crossVidiun');

      case type === VidiunDistributionProviderType.dailymotion:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.dailymotion');

      case type === VidiunDistributionProviderType.doubleclick:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.doubleclick');

      case type === VidiunDistributionProviderType.facebook:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.facebook');

      case type === VidiunDistributionProviderType.freewheel:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.freewheel');

      case type === VidiunDistributionProviderType.freewheelGeneric:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.freewheelGeneric');

      case type === VidiunDistributionProviderType.ftp:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.ftp');

      case type === VidiunDistributionProviderType.ftpScheduled:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.ftpScheduled');

      case type === VidiunDistributionProviderType.generic:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.generic');

      case type === VidiunDistributionProviderType.hulu:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.hulu');

      case type === VidiunDistributionProviderType.idetic:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.idetic');

      case type === VidiunDistributionProviderType.metroPcs:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.metroPcs');

      case type === VidiunDistributionProviderType.msn:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.msn');

      case type === VidiunDistributionProviderType.ndn:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.ndn');

      case type === VidiunDistributionProviderType.podcast:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.podcast');

      case type === VidiunDistributionProviderType.pushToNews:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.pushToNews');

      case type === VidiunDistributionProviderType.quickplay:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.quickplay');

      case type === VidiunDistributionProviderType.synacorHbo:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.synacorHbo');

      case type === VidiunDistributionProviderType.syndication:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.syndication');

      case type === VidiunDistributionProviderType.timeWarner:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.timeWarner');

      case type === VidiunDistributionProviderType.tvcom:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.tvcom');

      case type === VidiunDistributionProviderType.tvinci:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.tvinci');

      case type === VidiunDistributionProviderType.unicorn:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.unicorn');

      case type === VidiunDistributionProviderType.uverse:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.uverse');

      case type === VidiunDistributionProviderType.uverseClickToOrder:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.uverseClickToOrder');

      case type === VidiunDistributionProviderType.verizonVcast:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.verizonVcast');

      case type === VidiunDistributionProviderType.yahoo:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.yahoo');

      case type === VidiunDistributionProviderType.youtube:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.youtube');

      case type === VidiunDistributionProviderType.youtubeApi:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.youtubeApi');

      default:
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.unknown');

    }
  }

  public deleteDistributionProfile(profile: ExtendedVidiunEntryDistribution, closePopupCallback?: () => void): void {
    const entrySubmitted = [
      VidiunEntryDistributionStatus.ready,
      VidiunEntryDistributionStatus.errorUpdating
    ].indexOf(profile.status) !== -1;
    const entryNotSubmitted = [
      VidiunEntryDistributionStatus.queued,
      VidiunEntryDistributionStatus.pending,
      VidiunEntryDistributionStatus.errorSubmitting
    ].indexOf(profile.status) !== -1;
    let action;

    if (entrySubmitted) {
      action = new EntryDistributionSubmitDeleteAction({ id: profile.id });
    } else if (entryNotSubmitted) {
      action = new EntryDistributionDeleteAction({ id: profile.id });
    }

    if (!action) {
      this._browserService.alert({
        message: this._appLocalization.get('applications.content.entryDetails.distribution.errors.cannotDelete'),
      });
      return;
    }

    const partnerProfile = this.getPartnerProfileById(profile.distributionProfileId);
    const connectorName = partnerProfile
      ? this.getProviderName(partnerProfile.providerType)
      : this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.unknown');

    this._browserService.confirm({
        header: this._appLocalization.get('applications.content.entryDetails.distribution.deleteConfirmTitle'),
        message: this._appLocalization.get('applications.content.entryDetails.distribution.deleteConfirm', [connectorName]),
        acceptLabel: this._appLocalization.get('applications.content.entryDetails.distribution.delete'),
        rejectLabel: this._appLocalization.get('applications.content.entryDetails.distribution.cancel'),
        accept: () => {
            this._performDeleteRequest(action, closePopupCallback);
        }
    });
  }

  public loadMissingFlavors(flavors: Partial<Flavor>[]): Observable<{ id: string, name: string }[]> {
    const actions = flavors.map(({ id }) => new FlavorParamsGetAction({ id: Number(id) }));
    return this._vidiunClient.multiRequest(new VidiunMultiRequest(...actions))
      .map(responses => {
        return responses.map(response => {
          const result = response.result;
          if (response.error || !result) {
            throw Error(response.error
              ? response.error.message
              : this._appLocalization.get('applications.content.entryDetails.distribution.errors.serverError')
            );
          }

          return { id: String(result.id), name: result.name };
        });
      });
  }

  public distributeProfile(payload: { entryId: string, profileId: number, submitWhenReady: boolean }, closePopupCallback: () => void): void {
    const newEntryDistribution = new VidiunEntryDistribution({
      entryId: payload.entryId,
      distributionProfileId: payload.profileId
    });

    const actions: VidiunRequest<VidiunEntryDistribution>[] = [
      new EntryDistributionAddAction({ entryDistribution: newEntryDistribution })
    ];

    if (payload.submitWhenReady) {
      actions.push(
        new EntryDistributionSubmitAddAction({ id: 0, submitWhenReady: payload.submitWhenReady })
          .setDependency(['id', 0, 'id'])
      );
    }

    this._vidiunClient.multiRequest(new VidiunMultiRequest(...actions))
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .pipe(tag('block-shell'))
      .map(responses => {
        responses.forEach(response => {
          if (response.error instanceof VidiunAPIException) {
            throw Error(response.error.message);
          }
        });
      })
      .subscribe(
        () => {
          this.refresh();
          this.popupMessage = null;
          closePopupCallback();
        },
        error => {
          this.popupMessage = new AreaBlockerMessage({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.cannotDistribute'),
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this.refresh();
                this.popupMessage = null;
                closePopupCallback();
              }
            }]
          });
        });

  }

  public updateProfile(profile: ExtendedVidiunEntryDistribution, closePopupCallback: () => void): void {

    this._vidiunClient.request(new EntryDistributionUpdateAction({
      id: profile.id,
      entryDistribution: profile
    }))
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
          this.refresh();
          closePopupCallback();
        },
        error => {
          this.popupMessage = new AreaBlockerMessage({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.updateFailed'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.ok'),
                action: () => {
                  this.refresh();
                  this.popupMessage = null;
                  closePopupCallback();
                }
              }
            ]
          });
        });
  }

  public submitProfileUpdate(profileId: number): void {
    this._vidiunClient.request(new EntryDistributionSubmitUpdateAction({ id: profileId }))
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
          this.refresh();
          this.popupMessage = null;
          this._removeBlockerMessage();
        },
        error => {
          this.popupMessage = new AreaBlockerMessage({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.updateFailed'),
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this.popupMessage = null;
                this._removeBlockerMessage();
                this.refresh();
              }
            }]
          });
          this._showBlockerMessage(this.popupMessage, false);
        });
  }

  public submitDistribution(profileId: number): void {
    this._vidiunClient.request(new EntryDistributionSubmitAddAction({ id: profileId }))
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
          this.refresh();
          this.popupMessage = null;
          this._removeBlockerMessage();
        },
        error => {
          this.popupMessage = new AreaBlockerMessage({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.updateFailed'),
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this.popupMessage = null;
                this._removeBlockerMessage();
                this.refresh();
              }
            }]
          });
          this._showBlockerMessage(this.popupMessage, false);
        });
  }

  public retryDistribution(profileId: number): void {
    this._vidiunClient.request(new EntryDistributionRetrySubmitAction({ id: profileId }))
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
          this.refresh();
          this.popupMessage = null;
          this._removeBlockerMessage();
        },
        error => {
          this.popupMessage = new AreaBlockerMessage({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.retryFailed'),
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this.popupMessage = null;
                this._removeBlockerMessage();
                this.refresh();
              }
            }]
          });
          this._showBlockerMessage(this.popupMessage, false);
        });
  }

  public getPartnerProfileById(profileId): VidiunDistributionProfile {
    const partnerProfiles = this._partnerDistributionProfiles.getValue().items;

    if (partnerProfiles) {
      return partnerProfiles.find(({ id }) => id === profileId) || null;
    }

    return null;
  }

  public refresh(): void {
    super._showLoader();

    this._flavors.next({ items: [] });
    this._thumbnails.next({ items: [] });
    this._distributedProfiles.next({ items: [] });
    this._undistributedProfiles.next({ items: [] });

    this._loadDistributionData()
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .subscribe(
        (response) => {
          this._flavors.next({ items: response.flavors });
          this._thumbnails.next({ items: response.thumbnails });
          this._distributedProfiles.next({ items: response.distributedProfiles });
          this._undistributedProfiles.next({ items: response.undistributedProfiles });

          super._hideLoader();
        },
        error => {
          super._hideLoader();
          super._showBlockerMessage(new AreaBlockerMessage({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.errorLoading'),
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => this.refresh()
            }]
          }), true);
        });
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { KalturaAPIException, KalturaClient, KalturaMultiRequest, KalturaTypesFactory } from 'kaltura-ngx-client';
import { EntryWidgetKeys } from '../entry-widget-keys';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { EntryWidget } from '../entry-widget';
import { Observable } from 'rxjs/Observable';
import { DistributionProfileListAction } from 'kaltura-ngx-client/api/types/DistributionProfileListAction';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { EntryDistributionListAction } from 'kaltura-ngx-client/api/types/EntryDistributionListAction';
import { KalturaEntryDistributionFilter } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionFilter';
import { FlavorAssetGetFlavorAssetsWithParamsAction } from 'kaltura-ngx-client/api/types/FlavorAssetGetFlavorAssetsWithParamsAction';
import { ThumbAssetGetByEntryIdAction } from 'kaltura-ngx-client/api/types/ThumbAssetGetByEntryIdAction';
import { KalturaDistributionProfileListResponse } from 'kaltura-ngx-client/api/types/KalturaDistributionProfileListResponse';
import { KalturaDistributionProfileStatus } from 'kaltura-ngx-client/api/types/KalturaDistributionProfileStatus';
import { KalturaEntryDistributionListResponse } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionListResponse';
import { KalturaEntryDistributionStatus } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionStatus';
import { KalturaFlavorAssetWithParams } from 'kaltura-ngx-client/api/types/KalturaFlavorAssetWithParams';
import { KalturaLiveParams } from 'kaltura-ngx-client/api/types/KalturaLiveParams';
import { Flavor } from '../entry-flavours/flavor';
import { KalturaFlavorAssetStatus } from 'kaltura-ngx-client/api/types/KalturaFlavorAssetStatus';
import { KalturaWidevineFlavorAsset } from 'kaltura-ngx-client/api/types/KalturaWidevineFlavorAsset';
import { KalturaThumbAsset } from 'kaltura-ngx-client/api/types/KalturaThumbAsset';
import { KalturaEntryDistribution } from 'kaltura-ngx-client/api/types/KalturaEntryDistribution';
import { KalturaDistributionProfile } from 'kaltura-ngx-client/api/types/KalturaDistributionProfile';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryDistributionSubmitDeleteAction } from 'kaltura-ngx-client/api/types/EntryDistributionSubmitDeleteAction';
import { EntryDistributionDeleteAction } from 'kaltura-ngx-client/api/types/EntryDistributionDeleteAction';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaRequest } from 'kaltura-ngx-client/api/kaltura-request';
import { KalturaDistributionProfileActionStatus } from 'kaltura-ngx-client/api/types/KalturaDistributionProfileActionStatus';
import { FlavorParamsGetAction } from 'kaltura-ngx-client/api/types/FlavorParamsGetAction';
import { EntryDistributionAddAction } from 'kaltura-ngx-client/api/types/EntryDistributionAddAction';
import { EntryDistributionSubmitAddAction } from 'kaltura-ngx-client/api/types/EntryDistributionSubmitAddAction';
import { EntryDistributionUpdateAction } from 'kaltura-ngx-client/api/types/EntryDistributionUpdateAction';
import { EntryDistributionSubmitUpdateAction } from 'kaltura-ngx-client/api/types/EntryDistributionSubmitUpdateAction';
import { EntryDistributionRetrySubmitAction } from 'kaltura-ngx-client/api/types/EntryDistributionRetrySubmitAction';
import { KalturaDistributionProviderType } from 'kaltura-ngx-client/api/types/KalturaDistributionProviderType';

export interface ExtendedKalturaEntryDistribution extends KalturaEntryDistribution {
  name: string;
  autoDistribution: boolean;
}

export interface DistributionWidgetData {
  distributedProfiles: ExtendedKalturaEntryDistribution[],
  undistributedProfiles: KalturaDistributionProfile[],
  partnerDistributionProfiles: KalturaDistributionProfile[],
  flavors: Flavor[];
  thumbnails: KalturaThumbAsset[];
}

@Injectable()
export class EntryDistributionWidget extends EntryWidget implements OnDestroy {
  private _partnerDistributionProfiles = new BehaviorSubject<{ items: KalturaDistributionProfile[] }>({ items: [] });
  private _distributedProfiles = new BehaviorSubject<{ items: KalturaEntryDistribution[] }>({ items: [] });
  private _undistributedProfiles = new BehaviorSubject<{ items: KalturaDistributionProfile[] }>({ items: [] });
  private _flavors = new BehaviorSubject<{ items: Flavor[] }>({ items: [] });
  private _thumbnails = new BehaviorSubject<{ items: KalturaThumbAsset[] }>({ items: [] });

  public popupMessage: AreaBlockerMessage;
  public flavors$ = this._flavors.asObservable();
  public thumbnails$ = this._thumbnails.asObservable();
  public distributionProfiles$ = {
    distributed: this._distributedProfiles.asObservable(),
    undistributed: this._undistributedProfiles.asObservable()
  };

  constructor(private _appLocalization: AppLocalization,
              private _kalturaClient: KalturaClient,
              private _browserService: BrowserService) {
    super(EntryWidgetKeys.Distribution);
  }

  ngOnDestroy() {

  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset() {
    this._flavors.next({ items: [] });
    this._thumbnails.next({ items: [] });
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

  protected onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest): void {

  }

  private _mapPartnerDistributionResponse(response: KalturaDistributionProfileListResponse): KalturaDistributionProfile[] {
    if (!response || !Array.isArray(response.objects)) {
      return [];
    }
    return response.objects.filter(profile => profile.status === KalturaDistributionProfileStatus.enabled);
  }

  private _mapEntryDistributionResponse(response: KalturaEntryDistributionListResponse): KalturaEntryDistribution[] {
    if (!response || !Array.isArray(response.objects)) {
      return [];
    }
    return response.objects.filter(profile => profile.status !== KalturaEntryDistributionStatus.deleted);
  }

  private _mapEntryFlavorsResponse(response: KalturaFlavorAssetWithParams[]): Flavor[] {
    let flavors = [];
    if (response && response.length) {
      const flavorsWithAssets = [];
      const flavorsWithoutAssets = [];
      response.forEach((flavor: KalturaFlavorAssetWithParams) => {
        if (flavor.flavorAsset && flavor.flavorAsset.isOriginal) {
          flavors.push(this._createFlavor(flavor, response)); // this is the source. put it first in the array
        } else if (flavor.flavorAsset && (!flavor.flavorAsset.status ||
            (flavor.flavorAsset.status && flavor.flavorAsset.status.toString() !== KalturaFlavorAssetStatus.temp.toString()))) {
          flavorsWithAssets.push(this._createFlavor(flavor, response)); // flavors with assets that is not in temp status
        } else if (!flavor.flavorAsset && flavor.flavorParams && !(flavor.flavorParams instanceof KalturaLiveParams)) {
          flavorsWithoutAssets.push(this._createFlavor(flavor, response)); // flavors without assets
        }
      });
      // source first, then flavors with assets, then flavors without assets
      flavors = flavors.concat(flavorsWithAssets).concat(flavorsWithoutAssets);
    }

    return flavors;
  }

  private _createFlavor(flavor: KalturaFlavorAssetWithParams, allFlavors: KalturaFlavorAssetWithParams[]): Flavor {
    const newFlavor = <Flavor>flavor;
    newFlavor.name = flavor.flavorParams ? flavor.flavorParams.name : '';
    newFlavor.id = flavor.flavorAsset ? flavor.flavorAsset.id : '';
    newFlavor.paramsId = flavor.flavorParams.id;
    newFlavor.isSource = flavor.flavorAsset ? flavor.flavorAsset.isOriginal : false;
    newFlavor.isWidevine = flavor.flavorAsset ? flavor.flavorAsset instanceof KalturaWidevineFlavorAsset : false;
    newFlavor.isWeb = flavor.flavorAsset ? flavor.flavorAsset.isWeb : false;
    newFlavor.format = flavor.flavorAsset ? flavor.flavorAsset.fileExt : '';
    newFlavor.codec = flavor.flavorAsset ? flavor.flavorAsset.videoCodecId : '';
    newFlavor.bitrate = (flavor.flavorAsset && flavor.flavorAsset.bitrate && flavor.flavorAsset.bitrate > 0)
      ? flavor.flavorAsset.bitrate.toString()
      : '';
    newFlavor.size = flavor.flavorAsset ? (flavor.flavorAsset.status.toString() === KalturaFlavorAssetStatus.ready.toString()
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
        'applications.content.entryDetails.flavours.status.' + KalturaFlavorAssetStatus[flavor.flavorAsset.status]
      );
      if (flavor.flavorAsset.status.toString() === KalturaFlavorAssetStatus.notApplicable.toString()) {
        newFlavor.statusTooltip = this._appLocalization.get('applications.content.entryDetails.flavours.status.naTooltip');
      }
    }

    // add DRM details
    if (newFlavor.isWidevine) {
      // get source flavors for DRM
      const sourceIDs = (flavor.flavorAsset as KalturaWidevineFlavorAsset).actualSourceAssetParamsIds
        ? (flavor.flavorAsset as KalturaWidevineFlavorAsset).actualSourceAssetParamsIds.split(',')
        : [];
      const sources = [];
      sourceIDs.forEach(sourceId => {
        allFlavors.forEach(flavor => {
          if (flavor.flavorParams.id.toString() === sourceId) {
            sources.push(flavor.flavorParams.name);
          }
        });
      });
      // set start and end date
      let startDate = (flavor.flavorAsset as KalturaWidevineFlavorAsset).widevineDistributionStartDate;
      if (startDate === -2147483648 || startDate === 18001 || startDate === 2000001600) {
        startDate = null;
      }
      let endDate = (flavor.flavorAsset as KalturaWidevineFlavorAsset).widevineDistributionEndDate;
      if (endDate === -2147483648 || endDate === 18001 || endDate === 2000001600) {
        endDate = null;
      }
      newFlavor.drm = {
        name: flavor.flavorParams.name,
        id: (flavor.flavorAsset as KalturaWidevineFlavorAsset).widevineAssetId,
        flavorSources: sources,
        startTime: startDate,
        endTime: endDate
      };
    }
    return newFlavor;
  }

  private _mapThumbnailsResponse(response: KalturaThumbAsset[]): KalturaThumbAsset[] {
    if (response && response.length) {
      return response;
    }
    return [];
  }

  private _loadDistributionData(): Observable<DistributionWidgetData> {
    const partnerDistributionListAction = new DistributionProfileListAction({
      pager: new KalturaFilterPager({ pageSize: 500 })
    });

    const entryDistributionListAction = new EntryDistributionListAction({
      filter: new KalturaEntryDistributionFilter({ entryIdEqual: this.data.id })
    });

    const entryFlavorsListAction = new FlavorAssetGetFlavorAssetsWithParamsAction({ entryId: this.data.id });

    const entryThumbnailsListAction = new ThumbAssetGetByEntryIdAction({ entryId: this.data.id });

    return this._kalturaClient
      .multiRequest(new KalturaMultiRequest(
        partnerDistributionListAction,
        entryDistributionListAction,
        entryFlavorsListAction,
        entryThumbnailsListAction
      ))
      .cancelOnDestroy(this, this.widgetReset$)
      .map(([partnerDistribution, entryDistribution, entryFlavors, entryThumbnails]) => {
        if (partnerDistribution.error) {
          throw Error(partnerDistribution.error.message);
        }

        if (entryDistribution.error) {
          throw Error(entryDistribution.error.message);
        }

        if (entryFlavors.error) {
          throw Error(entryFlavors.error.message);
        }

        if (entryThumbnails.error) {
          throw Error(entryThumbnails.error.message);
        }
        const flavors = this._mapEntryFlavorsResponse(entryFlavors.result);
        const thumbnails = this._mapThumbnailsResponse(entryThumbnails.result);
        const partnerDistributionProfiles = this._mapPartnerDistributionResponse(partnerDistribution.result);
        const undistributedProfiles = [...partnerDistributionProfiles];
        const entryProfiles = this._mapEntryDistributionResponse(entryDistribution.result);
        const distributedProfiles = [];

        entryProfiles.forEach((profile) => {
          const relevantPartnerProfile = undistributedProfiles.find(({ id }) => id === profile.distributionProfileId);
          if (relevantPartnerProfile) {
            const autoDistribution = relevantPartnerProfile.submitEnabled === KalturaDistributionProfileActionStatus.automatic ||
              profile.status === KalturaEntryDistributionStatus.queued;
            const distributedProfile = <ExtendedKalturaEntryDistribution>Object.assign(
              KalturaTypesFactory.createObject(profile),
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

  private _performDeleteRequest(action: KalturaRequest<KalturaEntryDistribution | void>, closePopupCallback?: () => void): void {
    this._kalturaClient.request(action)
      .tag('block-shell')
      .cancelOnDestroy(this, this.widgetReset$)
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
                label: this._appLocalization.get('app.common.retry'),
                action: () => this._performDeleteRequest(action, closePopupCallback)
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => this._removeBlockerMessage()
              }
            ]
          }), false);
        }
      );
  }

  public setDirty(): void {
    super.updateState({ isDirty: true });
  }

  public getProviderName(type: KalturaDistributionProviderType): string {
    switch (true) {
      case type.equals(KalturaDistributionProviderType.attUverse):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.avn):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.avn');

      case type.equals(KalturaDistributionProviderType.comcastMrss):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.comcastMrss');

      case type.equals(KalturaDistributionProviderType.crossKaltura):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.crossKaltura');

      case type.equals(KalturaDistributionProviderType.dailymotion):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.dailymotion');

      case type.equals(KalturaDistributionProviderType.doubleclick):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.doubleclick');

      case type.equals(KalturaDistributionProviderType.facebook):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.facebook');

      case type.equals(KalturaDistributionProviderType.freewheel):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.freewheel');

      case type.equals(KalturaDistributionProviderType.freewheelGeneric):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.freewheelGeneric');

      case type.equals(KalturaDistributionProviderType.ftp):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.ftp');

      case type.equals(KalturaDistributionProviderType.ftpScheduled):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.ftpScheduled');

      case type.equals(KalturaDistributionProviderType.generic):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.generic');

      case type.equals(KalturaDistributionProviderType.hulu):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.hulu');

      case type.equals(KalturaDistributionProviderType.idetic):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.idetic');

      case type.equals(KalturaDistributionProviderType.metroPcs):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.metroPcs');

      case type.equals(KalturaDistributionProviderType.msn):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.msn');

      case type.equals(KalturaDistributionProviderType.ndn):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.ndn');

      case type.equals(KalturaDistributionProviderType.podcast):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.podcast');

      case type.equals(KalturaDistributionProviderType.pushToNews):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.pushToNews');

      case type.equals(KalturaDistributionProviderType.quickplay):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.quickplay');

      case type.equals(KalturaDistributionProviderType.synacorHbo):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.synacorHbo');

      case type.equals(KalturaDistributionProviderType.syndication):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.syndication');

      case type.equals(KalturaDistributionProviderType.timeWarner):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.timeWarner');

      case type.equals(KalturaDistributionProviderType.tvcom):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.tvcom');

      case type.equals(KalturaDistributionProviderType.tvinci):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.tvinci');

      case type.equals(KalturaDistributionProviderType.unicorn):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.unicorn');

      case type.equals(KalturaDistributionProviderType.uverse):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.uverse');

      case type.equals(KalturaDistributionProviderType.uverseClickToOrder):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.uverseClickToOrder');

      case type.equals(KalturaDistributionProviderType.verizonVcast):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.verizonVcast');

      case type.equals(KalturaDistributionProviderType.yahoo):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.yahoo');

      case type.equals(KalturaDistributionProviderType.youtube):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.youtube');

      case type.equals(KalturaDistributionProviderType.youtubeApi):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.youtubeApi');

      default:
        return '';

    }
  }

  public deleteDistributionProfile(profile: ExtendedKalturaEntryDistribution, closePopupCallback?: () => void): void {
    const entrySubmitted = [
      KalturaEntryDistributionStatus.ready,
      KalturaEntryDistributionStatus.errorUpdating
    ].indexOf(profile.status) !== -1;
    const entryNotSubmitted = [
      KalturaEntryDistributionStatus.queued,
      KalturaEntryDistributionStatus.pending,
      KalturaEntryDistributionStatus.errorSubmitting
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
    const connectorName = partnerProfile ? this.getProviderName(partnerProfile.providerType) : '';

    this.popupMessage = new AreaBlockerMessage({
      title: this._appLocalization.get('applications.content.entryDetails.distribution.deleteConfirmTitle'),
      message: this._appLocalization.get('applications.content.entryDetails.distribution.deleteConfirm', [connectorName]),
      buttons: [
        {
          label: this._appLocalization.get('applications.content.entryDetails.distribution.delete'),
          action: () => {
            this._performDeleteRequest(action, closePopupCallback);
          }
        },
        {
          label: this._appLocalization.get('applications.content.entryDetails.distribution.cancel'),
          action: () => {
            this.popupMessage = null;
            this._removeBlockerMessage();
          }
        }
      ]
    });
    this._showBlockerMessage(this.popupMessage, false);
  }

  public loadMissingFlavors(flavors: Partial<Flavor>[]): Observable<{ id: string, name: string }[]> {
    const actions = flavors.map(({ id }) => new FlavorParamsGetAction({ id: Number(id) }));
    return this._kalturaClient.multiRequest(new KalturaMultiRequest(...actions))
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
    const newEntryDistribution = new KalturaEntryDistribution({
      entryId: payload.entryId,
      distributionProfileId: payload.profileId
    });

    const actions: KalturaRequest<KalturaEntryDistribution>[] = [
      new EntryDistributionAddAction({ entryDistribution: newEntryDistribution })
    ];

    if (payload.submitWhenReady) {
      actions.push(
        new EntryDistributionSubmitAddAction({ id: 0, submitWhenReady: payload.submitWhenReady })
          .setDependency(['id', 0, 'id'])
      );
    }

    this._kalturaClient.multiRequest(new KalturaMultiRequest(...actions))
      .cancelOnDestroy(this, this.widgetReset$)
      .tag('block-shell')
      .map(responses => {
        responses.forEach(response => {
          if (response.error instanceof KalturaAPIException) {
            throw Error(response.error.message);
          }
        });
      })
      .subscribe(
        () => {
          this.refresh();
          closePopupCallback();
        },
        error => {
          this._browserService.alert({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.cannotDistribute')
          });
        });

  }

  public updateProfile(profile: ExtendedKalturaEntryDistribution, closePopupCallback: () => void): void {

    this._kalturaClient.request(new EntryDistributionUpdateAction({
      id: profile.id,
      entryDistribution: profile
    }))
      .cancelOnDestroy(this, this.widgetReset$)
      .tag('block-shell')
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
                label: this._appLocalization.get('app.common.retry'),
                action: () => this.updateProfile(profile, closePopupCallback)
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => this.popupMessage = null
              }
            ]
          });
        });
  }

  public submitProfileUpdate(profileId: number): void {
    this._kalturaClient.request(new EntryDistributionSubmitUpdateAction({ id: profileId }))
      .cancelOnDestroy(this, this.widgetReset$)
      .tag('block-shell')
      .subscribe(
        () => {
          this.refresh();
        },
        error => {
          this._browserService.alert({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.updateFailed'),
          });
        });
  }

  public submitDistribution(profileId: number): void {
    this._kalturaClient.request(new EntryDistributionSubmitAddAction({ id: profileId }))
      .cancelOnDestroy(this, this.widgetReset$)
      .tag('block-shell')
      .subscribe(
        () => {
          this.refresh();
        },
        error => {
          this._browserService.alert({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.updateFailed'),
          });
        });
  }

  public retryDistribution(profileId: number): void {
    this._kalturaClient.request(new EntryDistributionRetrySubmitAction({ id: profileId }))
      .cancelOnDestroy(this, this.widgetReset$)
      .tag('block-shell')
      .subscribe(
        () => {
          this.refresh();
        },
        error => {
          this._browserService.alert({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.distribution.errors.retryFailed'),
          });
        });
  }

  public getPartnerProfileById(profileId): KalturaDistributionProfile {
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
      .cancelOnDestroy(this, this.widgetReset$)
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
              label: this._appLocalization.get('app.common.retry'),
              action: () => this.refresh()
            }]
          }), true);
        });
  }
}

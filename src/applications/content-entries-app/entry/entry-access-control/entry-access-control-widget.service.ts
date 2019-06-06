import {Injectable, OnDestroy} from '@angular/core';
import { Observable } from 'rxjs';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SelectItem} from 'primeng/primeng';

import {VidiunMultiRequest} from 'vidiun-ngx-client';
import {VidiunMediaEntry} from 'vidiun-ngx-client';
import {VidiunAccessControl} from 'vidiun-ngx-client';
import {VidiunSiteRestriction} from 'vidiun-ngx-client';
import {VidiunSiteRestrictionType} from 'vidiun-ngx-client';
import {VidiunCountryRestriction} from 'vidiun-ngx-client';
import {VidiunCountryRestrictionType} from 'vidiun-ngx-client';
import {VidiunIpAddressRestriction} from 'vidiun-ngx-client';
import {VidiunIpAddressRestrictionType} from 'vidiun-ngx-client';
import {VidiunLimitFlavorsRestriction} from 'vidiun-ngx-client';
import {VidiunLimitFlavorsRestrictionType} from 'vidiun-ngx-client';
import {VidiunSessionRestriction} from 'vidiun-ngx-client';
import {VidiunPreviewRestriction} from 'vidiun-ngx-client';
import {VidiunFlavorParams} from 'vidiun-ngx-client';
import {AccessControlProfileStore, FlavoursStore} from 'app-shared/vmc-shared';
import {VidiunUtils} from '@vidiun-ng/vidiun-common';
import {AppLocalization} from '@vidiun-ng/mc-shared';

import 'rxjs/add/observable/forkJoin';
import * as R from 'ramda';
import {EntryWidget} from '../entry-widget';
import { ContentEntryViewSections } from 'app-shared/vmc-shared/vmc-views/details-views/content-entry-view.service';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Injectable()
export class EntryAccessControlWidget extends EntryWidget implements OnDestroy {

  private _accessControlProfiles = new BehaviorSubject<{ items: SelectItem[] }>({items: []});

  public _accessControlProfiles$ = this._accessControlProfiles.asObservable();

  private _selectedProfile: VidiunAccessControl = null;
  public set selectedProfile(profile: VidiunAccessControl) {
    this._selectedProfile = profile;
    this._setRestrictions();
  }

  public get selectedProfile() {
    return this._selectedProfile;
  }

  public _domainsRestriction: string = "";
  public _countriesRestriction: string = "";
  public _ipRestriction: string = "";
  public _flavourRestriction: string = "";
  public _advancedRestriction: string = "";

  private _flavourParams: VidiunFlavorParams[] = [];

  constructor(private _accessControlProfileStore: AccessControlProfileStore,
              private _appLocalization: AppLocalization,
              private _flavoursStore: FlavoursStore,
              logger: VidiunLogger) {
    super(ContentEntryViewSections.AccessControl, logger);
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset() {
  }

  protected onActivate(firstTimeActivating: boolean) {
    if (firstTimeActivating) {
      super._showLoader();
      this._accessControlProfiles.next({items: []});

      const getAPProfiles$ = this._accessControlProfileStore.get().pipe(cancelOnDestroy(this));
      const getFlavours$ = this._flavoursStore.get().pipe(cancelOnDestroy(this));

      return Observable.forkJoin(getAPProfiles$, getFlavours$)
        .pipe(cancelOnDestroy(this))
        .map(
          response => {
            let ACProfiles = response[0].items;
            if (ACProfiles.length) {
              // check if any of the access control profiles is defined as default
              const defaultIndex = R.findIndex(R.propEq('isDefault', 1))(ACProfiles);
              if (defaultIndex > -1) {
                // put the default profile at the beginning of the profiles array
                const defaultProfile: VidiunAccessControl[] = ACProfiles.splice(defaultIndex, 1);
                ACProfiles.splice(0, 0, defaultProfile[0]);
              }
              let profilesDataProvider: SelectItem[] = [];
              ACProfiles.forEach((profile: VidiunAccessControl) => {
                profilesDataProvider.push({"label": profile.name, "value": profile});
              });
              this._flavourParams = response[1].items;
              this._accessControlProfiles.next({items: profilesDataProvider});
              this._setProfile();
              super._hideLoader();
            }

              return {failed: false};

          })
        .catch((error, caught) => {
            super._hideLoader();
            super._showActivationError();
            this._accessControlProfiles.next({items: []});
            return Observable.throw(error);
          }
        );
    } else {
      this._setProfile();
    }
  }

  protected onDataSaving(data: VidiunMediaEntry, request: VidiunMultiRequest) {
    if (this.selectedProfile) {
      data.accessControlId = this.selectedProfile.id;
    }

  }

  private _fetchAccessControlProfiles(): void {

  }

  private _setProfile() {
    // search for the current entry access profile and select it in the drop down if found
    let profilesDataProvider = this._accessControlProfiles.getValue().items;
    let profilesArr: VidiunAccessControl[] = [];
    profilesDataProvider.forEach(profile => {
      profilesArr.push(profile.value)
    });
    let entryACProfileIndex = R.findIndex(R.propEq('id', this.data.accessControlId))(profilesArr);
    entryACProfileIndex = entryACProfileIndex === -1 ? 0 : entryACProfileIndex;
    this.selectedProfile = profilesArr[entryACProfileIndex];
  }

  private _setRestrictions() {

    this._domainsRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.anyDomain');
    this._countriesRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.anyCountry');
    this._ipRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.anyIP');
    this._flavourRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.anyFlavour');
    this._advancedRestriction = "";

    const restrictions = this.selectedProfile.restrictions;
    if (restrictions.length) {
      restrictions.forEach(restriction => {
        // domains restrictions
        if (restriction instanceof VidiunSiteRestriction) {
          if (restriction.siteRestrictionType === VidiunSiteRestrictionType.allowSiteList) {
            this._domainsRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.allowDomains', {"0": restriction.siteList});
          }
          if (restriction.siteRestrictionType === VidiunSiteRestrictionType.restrictSiteList) {
            this._domainsRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.blockDomains', {"0": restriction.siteList});
          }
        }
        // countries restrictions
        if (restriction instanceof VidiunCountryRestriction) {
          if (restriction.countryRestrictionType === VidiunCountryRestrictionType.allowCountryList) {
            this._countriesRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.allowCountries', {"0": this._getCountriesByCode(restriction.countryList)});
          }
          if (restriction.countryRestrictionType === VidiunCountryRestrictionType.restrictCountryList) {
            this._countriesRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.blockCountries', {"0": this._getCountriesByCode(restriction.countryList)});
          }
        }
        // IP restrictions
        if (restriction instanceof VidiunIpAddressRestriction) {
          if (restriction.ipAddressRestrictionType === VidiunIpAddressRestrictionType.allowList) {
            this._ipRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.allowIPs', {"0": restriction.ipAddressList});
          }
          if (restriction.ipAddressRestrictionType === VidiunIpAddressRestrictionType.restrictList) {
            this._ipRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.blockIPs', {"0": restriction.ipAddressList});
          }
        }
        // Flavour restrictions
        if (restriction instanceof VidiunLimitFlavorsRestriction && this._flavourParams.length) {
          // convert flavour IDs to flavour names
          let flavourIDs = restriction.flavorParamsIds.split(",");
          let flavourNames = [];
          flavourIDs.forEach(flavourId => {
            let flavour: VidiunFlavorParams = R.find(R.propEq('id', parseInt(flavourId)))(this._flavourParams);
            if (flavour !== undefined) {
              flavourNames.push(flavour.name);
            }
          });

          if (restriction.limitFlavorsRestrictionType === VidiunLimitFlavorsRestrictionType.allowList) {
            this._flavourRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.allowFlavours', {"0": flavourNames.join(", ")});
          }
          if (restriction.limitFlavorsRestrictionType === VidiunLimitFlavorsRestrictionType.restrictList) {
            this._flavourRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.blockFlavours', {"0": flavourNames.join(", ")});
          }
        }
        // Advanced restrictions
        if (restriction instanceof VidiunSessionRestriction) {
          this._advancedRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.vs');
        }
        if (restriction instanceof VidiunPreviewRestriction) {
          this._advancedRestriction = this._appLocalization.get('applications.content.entryDetails.accessControl.freePreview', {"0": VidiunUtils.formatTime(restriction.previewLength, true)});
        }
      });
    }
  }

  public setDirty() {
    super.updateState({isDirty: true});
  }

  private _getCountriesByCode(codesList: string): string {
    let countries = [];
    const codes = codesList.split(",");
    codes.forEach(code => {
      const country = this._appLocalization.get('countries.' + code.toLowerCase());
      if (country) {
        countries.push(country);
      }
    });
    return countries.join(", ");
  }

  ngOnDestroy()
  {

  }

}

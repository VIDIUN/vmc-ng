import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { Flavor } from '../../entry-flavours/flavor';
import { VidiunDistributionProfile } from 'vidiun-ngx-client';
import { EntryDistributionWidget, ExtendedVidiunEntryDistribution } from '../entry-distribution-widget.service';
import { VidiunBaseEntry } from 'vidiun-ngx-client';
import { AppAuthentication, BrowserService } from 'app-shared/vmc-shell';
import { VidiunThumbAsset } from 'vidiun-ngx-client';
import { VidiunDistributionThumbDimensions } from 'vidiun-ngx-client';
import { VidiunThumbAssetStatus } from 'vidiun-ngx-client';
import { getVidiunServerUri } from 'config/server';
import { subApplicationsConfig } from 'config/sub-applications';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { VidiunNullableBoolean } from 'vidiun-ngx-client';
import { VidiunDistributionProfileActionStatus } from 'vidiun-ngx-client';
import { VidiunEntryDistributionStatus } from 'vidiun-ngx-client';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';

export interface ExtendedVidiunDistributionThumbDimensions extends VidiunDistributionThumbDimensions {
  entryThumbnails?: {
    size: number,
    url: string;
    id: string
  }[]
}

@Component({
  selector: 'vEditDistributionProfile',
  templateUrl: './edit-distribution-profile.component.html',
  styleUrls: ['./edit-distribution-profile.component.scss']
})
export class EditDistributionProfileComponent implements OnInit {
  @Input() parentPopup: PopupWidgetComponent;
  @Input() distributedProfile: ExtendedVidiunEntryDistribution | null;
  @Input() undistributedProfile: VidiunDistributionProfile;
  @Input() flavors: Flavor[] = [];
  @Input() entry: VidiunBaseEntry;
  @Input() thumbnails: VidiunThumbAsset[] = [];

  @Output() onActionSelected = new EventEmitter<{ action: string, payload: any }>();

  public _profile: VidiunDistributionProfile | ExtendedVidiunEntryDistribution;
  public _forDistribution = true;
  public _requiredFlavors: Partial<Flavor>[] = [];
  public _requiredThumbnails: ExtendedVidiunDistributionThumbDimensions[] = [];
  public _profileName = '';
  public _distributionName = '';
  public _createdAtDateRange = subApplicationsConfig.shared.datesRange;
  public _createdFilterError = '';
  public _missingFlavorError = '';
  public _missingThumbnailError = '';
  public _requestXmlLink = '';
  public _responseXmlLink = '';
  public _vmcPermissions = VMCPermissions;

  public _distributionForm: FormGroup;
  public _updatesField: AbstractControl;
  public _startDateField: AbstractControl;
  public _endDateField: AbstractControl;
    public _calendarFormat = this._browserService.getCurrentDateFormat(true);

  constructor(private _appLocalization: AppLocalization,
              private _widget: EntryDistributionWidget,
              private _fb: FormBuilder,
              private _appAuthentication: AppAuthentication,
              private _permissionsService: VMCPermissionsService,
              private _browserService: BrowserService) {
    this._buildForm();
  }

  public get _actionDisabled(): boolean {
    let updateDisabled = false;
    let updateForAutoDistributionDisabled = false;
    if (!this._forDistribution) {
      const autoUpdates = this.undistributedProfile.submitEnabled === VidiunDistributionProfileActionStatus.automatic;

      updateForAutoDistributionDisabled = autoUpdates
        && !this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_SEND);

      updateDisabled = !this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_WHERE);
    }

    return !!(this._createdFilterError || this._missingFlavorError || this._missingThumbnailError
      || updateDisabled || updateForAutoDistributionDisabled);
  }

  public get _addButtonLabel(): string {
    return this._forDistribution
      ? this._appLocalization.get('applications.content.entryDetails.distribution.export')
      : this._appLocalization.get('applications.content.entryDetails.distribution.update');
  }

  ngOnInit() {
    this._prepare();
  }

  public _onCreatedChanged(): void {
    const startDate = this._startDateField.value;
    const endDate = this._endDateField.value;

    if (startDate && endDate) {
      const isValid = startDate <= endDate;

      if (isValid) {
        this._createdFilterError = null;
      } else {
        this._createdFilterError = this._appLocalization.get('applications.content.entryDetails.distribution.errors.datesRangeError');
      }
    }
  }

  public _cancel(): void {
    if (this._distributionForm.dirty) {
      this._browserService.confirm({
        message: this._appLocalization.get('applications.content.entryDetails.distribution.form.discardChanges'),
        accept: () => {
          this.parentPopup.close();
        }
      });
    } else {
      this.parentPopup.close();
    }
  }

  public _saveProfile(): void {
    if (this._createdFilterError || this._missingFlavorError || this._missingThumbnailError) {
      this._browserService.alert({
        message: this._createdFilterError || this._missingFlavorError || this._missingThumbnailError
      });
      return;
    }

    if (this._forDistribution) {
      const payload = { entryId: this.entry.id, profileId: this.undistributedProfile.id, submitWhenReady: !!this._updatesField.value };
      this.onActionSelected.emit({ action: 'distribute', payload });
    } else {
      if (this._startDateField.dirty || this._endDateField.dirty) {
        this.distributedProfile.sunrise = this._startDateField.value || null;
        this.distributedProfile.sunset = this._endDateField.value || null;
        this.onActionSelected.emit({ action: 'update', payload: this.distributedProfile });
      } else {
        this.parentPopup.close();
      }
    }
  }

  public _deleteProfile(profile: ExtendedVidiunEntryDistribution): void {
    this.onActionSelected.emit({ action: 'delete', payload: profile });
  }

  private _buildForm(): void {
    this._distributionForm = this._fb.group({
      updates: false,
      startDate: null,
      endDate: null
    });

    this._updatesField = this._distributionForm.controls['updates'];
    this._startDateField = this._distributionForm.controls['startDate'];
    this._endDateField = this._distributionForm.controls['endDate'];
  }

  private _prepare(): void {
    if (!this.undistributedProfile) {
      throw Error('Distribution profile must be defined');
    }

    this._forDistribution = !this.distributedProfile;
    this._profile = this.distributedProfile || this.undistributedProfile;
    this._profileName = this._profile.name;

    if (this._forDistribution) {
      this._startDateField.disable({ onlySelf: true });
      this._endDateField.disable({ onlySelf: true });

      if (!this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_SEND)) {
        this._updatesField.disable({ onlySelf: true });
      }
    } else {
      this._distributionName = this._widget.getProviderName(this.undistributedProfile.providerType);

      if (this.distributedProfile.hasSubmitSentDataLog === VidiunNullableBoolean.trueValue) {
        this._requestXmlLink = getVidiunServerUri(`/api_v3/index.php/service/contentDistribution_entryDistribution/action/serveSentData/actionType/1/id/${this.distributedProfile.id}/vs/${this._appAuthentication.appUser.vs}`);
      }

      if (this.distributedProfile.hasSubmitResultsLog === VidiunNullableBoolean.trueValue) {
        this._responseXmlLink = getVidiunServerUri(`/api_v3/index.php/service/contentDistribution_entryDistribution/action/serveReturnedData/actionType/1/id/${this.distributedProfile.id}/vs/${this._appAuthentication.appUser.vs}`);
      }

      const autoSubmitEnabled = this.undistributedProfile.submitEnabled === VidiunDistributionProfileActionStatus.automatic
        && this.distributedProfile.status === VidiunEntryDistributionStatus.queued;
      if (autoSubmitEnabled) {
        this._updatesField.enable({ onlySelf: true });
      } else {
        this._updatesField.disable({ onlySelf: true });
      }

      const hasAutoSubmit = this.undistributedProfile.submitEnabled === VidiunDistributionProfileActionStatus.automatic;
      const noSendPermissions = !this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_SEND);
      const noWherePermissions = !this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_WHERE);
      if (noWherePermissions || (hasAutoSubmit && noSendPermissions)) {
        this._startDateField.disable({ onlySelf: true });
        this._endDateField.disable({ onlySelf: true });
      }

      const updates = this.undistributedProfile.submitEnabled === VidiunDistributionProfileActionStatus.automatic;
      const startDate = this.distributedProfile.sunrise || null;
      const endDate = this.distributedProfile.sunset || null;
      this._distributionForm.setValue(
        { updates, startDate, endDate },
        { emitEvent: false }
      );
    }

    this._prepareFlavors();
    this._prepareThumbnails();
  }

  private _prepareFlavors(): void {
    const requiredFlavorsIds = (this.undistributedProfile.requiredFlavorParamsIds || '').split(',');
    if (requiredFlavorsIds.length) {
      const requiredFlavors = requiredFlavorsIds.map(flavorId => {
        const relevantFlavor = this.flavors.find(({ paramsId }) => Number(flavorId) === paramsId);
        if (relevantFlavor) {
          (<any>relevantFlavor).size = Number(relevantFlavor.size); // prevent vFileSize pipe fail on string
          return relevantFlavor;
        }
        return { id: flavorId, name: '' };
      });

      this._requiredFlavors = requiredFlavors;

      const missingFlavors = requiredFlavors.filter(({ name }) => !name);
      if (missingFlavors.length) {
        this._widget.loadMissingFlavors(missingFlavors)
          .subscribe(
            response => {
              response.forEach(item => {
                const relevantMissingFlavor = requiredFlavors.find(({ id }) => id === item.id);
                if (relevantMissingFlavor) {
                  relevantMissingFlavor.name = item.name;
                }
              });
              this._missingFlavorError = this._appLocalization.get('applications.content.entryDetails.distribution.errors.missingFlavors');
              this._requiredFlavors = [...requiredFlavors];
            },
            error => {
              this._browserService.alert({
                message: this._appLocalization.get(
                  'applications.content.entryDetails.distribution.errors.failedLoadMissingFlavors',
                  [
                    error.message
                    || this._appLocalization.get('applications.content.entryDetails.distribution.errors.serverError')
                  ]
                ),
                accept: () => {
                  this.parentPopup.close();
                }
              });
            });
      }
    }
  }

  private _prepareThumbnails(): void {
    const entryThumbnails = this.thumbnails.filter(thumbnail => thumbnail.status === VidiunThumbAssetStatus.ready);
    this._requiredThumbnails = this.undistributedProfile.requiredThumbDimensions.map(thumbnail => {
      const relevantEntryThumbnails = entryThumbnails.filter(item => item.width === thumbnail.width && item.height === thumbnail.height);
      if (relevantEntryThumbnails.length) {
        (<ExtendedVidiunDistributionThumbDimensions>thumbnail).entryThumbnails = relevantEntryThumbnails.map(relevantEntryThumbnail => ({
          id: relevantEntryThumbnail.id,
          size: Number(relevantEntryThumbnail.size),
          url: getVidiunServerUri(`/api_v3/index.php/service/thumbasset/action/serve/vs/${this._appAuthentication.appUser.vs}/thumbAssetId/${relevantEntryThumbnail.id}`)
        }));
      } else {
        this._missingThumbnailError = this._appLocalization.get('applications.content.entryDetails.distribution.errors.missingThumbnails');
      }
      return thumbnail;
    });
  }
}


import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EntryDistributionWidget, ExtendedVidiunEntryDistribution } from '../entry-distribution-widget.service';
import { VidiunEntryDistributionFlag } from 'vidiun-ngx-client';
import { VidiunEntryDistributionStatus } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunDistributionProviderType } from 'vidiun-ngx-client';
import { subApplicationsConfig } from 'config/sub-applications';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vEntryDistributedProfile',
  templateUrl: './distributed-profile.component.html',
  styleUrls: ['./distributed-profile.component.scss']
})
export class DistributedProfileComponent implements OnInit {
  @Input() profile: ExtendedVidiunEntryDistribution | null;

  @Output() onActionSelected = new EventEmitter<{ action: string, payload: any }>();

  public _profile: ExtendedVidiunEntryDistribution;
  public _isModified = false;
  public _actionButtonLabel = '';
  public _actionButtonDisabled = true;
  public _actionButtonHidden = true;
  public _deleteButtonHidden = true;
  public _providerType: VidiunDistributionProviderType = null;
  public _distributorPageLink = '';
  public _vmcPermissions = VMCPermissions;

  constructor(private _appLocalization: AppLocalization,
              private _permissionsService: VMCPermissionsService,
              private _widgetService: EntryDistributionWidget) {

  }

  ngOnInit() {
    this._prepare();
  }

  private _prepare(): void {
    if (this.profile) {
      this._profile = this.profile;
      this._isModified = this._profile.dirtyStatus === VidiunEntryDistributionFlag.updateRequired;
      this._setupActionButton();
      this._setupDeleteButton();
      this._setupDistributorPageLink();
    }
  }

  private _setupDistributorPageLink(): void {
    const distributionProfile = this._widgetService.getPartnerProfileById(this.profile.distributionProfileId);

    if (distributionProfile) {
      this._providerType = distributionProfile ? distributionProfile.providerType : null;

      const youtubeDistributorPageLink = this._providerType === VidiunDistributionProviderType.youtube
        || this._providerType === VidiunDistributionProviderType.youtubeApi;
      const facebookDistributorPageLink = this._providerType === VidiunDistributionProviderType.facebook;
      const isReady = this.profile.status === VidiunEntryDistributionStatus.ready;
      const showLink = isReady && (youtubeDistributorPageLink || facebookDistributorPageLink) && this._profile.remoteId;

      if (showLink) {
        const link = youtubeDistributorPageLink
          ? subApplicationsConfig.contentEntriesApp.distribution.youtubeExternal
          : subApplicationsConfig.contentEntriesApp.distribution.facebookExternal;
        this._distributorPageLink = `${link}${this._profile.remoteId}`;
      }
    }
  }

  private _setupActionButton(): void {
    const { status, dirtyStatus } = this._profile;
    this._actionButtonHidden = false;
    this._actionButtonDisabled = false;

    switch (status) {
      case VidiunEntryDistributionStatus.ready:
        if (dirtyStatus === VidiunEntryDistributionFlag.updateRequired) {
          this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.export');
          this._actionButtonDisabled = false;
        } else {
          this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.upToDate');
          this._actionButtonDisabled = true;
        }
        break;
      case VidiunEntryDistributionStatus.errorDeleting:
      case VidiunEntryDistributionStatus.errorSubmitting:
      case VidiunEntryDistributionStatus.errorUpdating:
        this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.retry');
        this._actionButtonDisabled = false;
        break;
      case VidiunEntryDistributionStatus.submitting:
      case VidiunEntryDistributionStatus.importSubmitting:
      case VidiunEntryDistributionStatus.updating:
      case VidiunEntryDistributionStatus.importUpdating:
      case VidiunEntryDistributionStatus.deleting:
        this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.processing');
        this._actionButtonDisabled = true;
        break;
      case VidiunEntryDistributionStatus.queued:
      case VidiunEntryDistributionStatus.pending:
      case VidiunEntryDistributionStatus.removed:
        this._actionButtonLabel = this._appLocalization.get('applications.content.entryDetails.distribution.export');
        break;
      default:
        this._actionButtonHidden = true;
        break;
    }
  }

  private _setupDeleteButton(): void {
    const enabledStatuses = [
      VidiunEntryDistributionStatus.ready,
      VidiunEntryDistributionStatus.errorUpdating,
      VidiunEntryDistributionStatus.queued,
      VidiunEntryDistributionStatus.pending,
      VidiunEntryDistributionStatus.errorSubmitting
    ];

    this._deleteButtonHidden = enabledStatuses.indexOf(this._profile.status) === -1;
  }

  public _performAction(profile: ExtendedVidiunEntryDistribution): void {
    switch (profile.status) {
      case VidiunEntryDistributionStatus.errorDeleting:
      case VidiunEntryDistributionStatus.errorSubmitting:
      case VidiunEntryDistributionStatus.errorUpdating:
        this.onActionSelected.emit({ action: 'retry', payload: profile.id });
        break;

      case VidiunEntryDistributionStatus.pending:
      case VidiunEntryDistributionStatus.removed:
      case VidiunEntryDistributionStatus.deleted:
      case VidiunEntryDistributionStatus.queued:
        this.onActionSelected.emit({ action: 'distribute', payload: profile.id });
        break;

      case VidiunEntryDistributionStatus.ready:
        if (profile.dirtyStatus === VidiunEntryDistributionFlag.updateRequired) {
          this.onActionSelected.emit({ action: 'sendUpdate', payload: profile.id });
        }
        break;

      default:
        break;

    }
  }

  public _openProfile(profile: ExtendedVidiunEntryDistribution): void {
    this.onActionSelected.emit({ action: 'open', payload: profile });
  }

  public _deleteDistribution(profile: ExtendedVidiunEntryDistribution): void {
    this.onActionSelected.emit({ action: 'deleteDistribution', payload: profile });
  }
}


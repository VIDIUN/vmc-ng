import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunEntryDistribution } from 'vidiun-ngx-client';
import { VidiunEntryDistributionStatus } from 'vidiun-ngx-client';
import { VidiunEntryDistributionFlag } from 'vidiun-ngx-client';

@Pipe({ name: 'vEntriesDistributionStatus' })
export class DistributionStatusPipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {

  }

  transform(profile: VidiunEntryDistribution, type: 'icon' | 'label'): string {
    const result = {
      icon: '',
      label: ''
    };

    if (!profile) {
      return '';
    }

    switch (profile.status) {
      case VidiunEntryDistributionStatus.pending:
        if (!profile.validationErrors || profile.validationErrors.length === 0) {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.readyForDistribution');
          result.icon = 'vIconinactive';
        } else if (profile.dirtyStatus === VidiunEntryDistributionFlag.submitRequired) {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.scheduledForDistribution');
          result.icon = 'vIconscheduled';
        } else if (profile.validationErrors && profile.validationErrors.length) {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.exportFailed');
          result.icon = 'vIconerror';
        }
        break;

      case VidiunEntryDistributionStatus.queued:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.queued');
        result.icon = 'vIconupload2';
        break;

      case VidiunEntryDistributionStatus.ready:
        if (profile.dirtyStatus === VidiunEntryDistributionFlag.updateRequired) {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.readyUpdateRequired');
        } else {
          result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.ready');
        }
        result.icon = 'vIconcomplete';
        break;

      case VidiunEntryDistributionStatus.deleted:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.deleted');
        result.icon = 'vIconinactive';
        break;

      case VidiunEntryDistributionStatus.submitting:
      case VidiunEntryDistributionStatus.importSubmitting:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.submitting');
        result.icon = 'vIconsync';
        break;

      case VidiunEntryDistributionStatus.updating:
      case VidiunEntryDistributionStatus.importUpdating:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.updating');
        result.icon = 'vIconsync';
        break;

      case VidiunEntryDistributionStatus.deleting:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.deleting');
        result.icon = 'vIconsync';
        break;

      case VidiunEntryDistributionStatus.errorSubmitting:
      case VidiunEntryDistributionStatus.errorUpdating:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.errorSubmitting');
        result.icon = 'vIconerror';
        break;

      case VidiunEntryDistributionStatus.errorDeleting:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.errorDeleting');
        result.icon = 'vIconerror';
        break;

      case VidiunEntryDistributionStatus.removed:
        result.label = this._appLocalization.get('applications.content.entryDetails.distribution.status.removed');
        result.icon = 'vIconinactive';
        break;

      default:
        break;
    }

    return type === 'icon' ? result.icon : result.label;
  }
}

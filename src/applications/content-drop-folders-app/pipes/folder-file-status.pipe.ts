import { Pipe, PipeTransform } from '@angular/core';
import { VidiunDropFolderFileStatus } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({ name: 'vFolderFileStatus' })
export class FolderFileStatusPipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: string, isIcon: boolean, isTooltip: boolean): string {
    let className = '';
    let label = '';
    let tooltip = '';
    if (typeof(value) !== 'undefined' && value !== null) {
      switch (parseInt(value, 10)) {
        case VidiunDropFolderFileStatus.uploading:
          className = 'vIconsync vIconBlue';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.uploading');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.uploading');
          break;
        case VidiunDropFolderFileStatus.downloading:
          className = 'vIconsync vIconBlue';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.downloading');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.downloading');
          break;
        case VidiunDropFolderFileStatus.pending:
          className = 'vIconupload2 vIconOrange';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.pending');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.pending');
          break;
        case VidiunDropFolderFileStatus.processing:
          className = 'vIconsync vIconBlue';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.processing');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.processing');
          break;
        case VidiunDropFolderFileStatus.parsed:
          className = 'vIconupload2 vIconOrange';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.parsedFromXml');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.parsedFromXml');
          break;
        case VidiunDropFolderFileStatus.waiting:
          className = 'vIconupload2 vIconOrange';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.waitingForRelatedFiles');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.waitingForRelatedFiles');
          break;
        case VidiunDropFolderFileStatus.noMatch:
          className = 'vIconupload2 vIconOrange';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.waitingForMatchedEntry');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.waitingForMatchedEntry');
          break;
        case VidiunDropFolderFileStatus.errorHandling:
          className = 'vIconerror vIconRed';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.error');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.error');
          break;
        case VidiunDropFolderFileStatus.errorDeleting:
          className = 'vIconerror vIconRed';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.deleteFailed');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.deleteFailed');
          break;
        case VidiunDropFolderFileStatus.handled:
          className = 'vIconcomplete vIconGreen';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.done');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.done');
          break;
        case VidiunDropFolderFileStatus.errorDownloading:
          className = 'vIconerror vIconRed';
          label = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusLabels.downloadFailed');
          tooltip = this._appLocalization.get('applications.content.dropFolders.dropFolderStatusTooltips.downloadFailed');
          break;
        default:
          className = 'vIconUnknown vIconRed';
          label = this._appLocalization.get('applications.content.dropFolders.table.unknown');
          tooltip = this._appLocalization.get('applications.content.dropFolders.table.unknown');
          break;
      }
    }
    if (isIcon) {
      return className;
    } else if (isTooltip) {
      return tooltip;
    } else {
      return label;
    }
  }
}

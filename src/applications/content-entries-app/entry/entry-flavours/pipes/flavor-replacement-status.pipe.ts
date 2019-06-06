import { Pipe, PipeTransform } from '@angular/core';
import { VidiunEntryReplacementStatus } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({ name: 'vFlavorReplacementStatus' })
export class FlavorReplacementStatusPipe implements PipeTransform {
    constructor(private _appLocalization: AppLocalization) {

    }

    transform(replacementStatus: VidiunEntryReplacementStatus, type: 'icon' | 'label'): string {
        const result = {
            icon: '',
            label: ''
        };

        if (!replacementStatus) {
            return '';
        }

        switch (replacementStatus) {
            case VidiunEntryReplacementStatus.approvedButNotReady:
            case VidiunEntryReplacementStatus.notReadyAndNotApproved:
                result.label = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replacementStatus.replacementInProcess');
                result.icon = 'vIconsync';
                break;
            case VidiunEntryReplacementStatus.readyButNotApproved:
                result.label = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replacementStatus.readyForReplacement');
                result.icon = 'vIconcomplete';
                break;
            case VidiunEntryReplacementStatus.failed:
                result.label = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replacementStatus.replacementFailed');
                result.icon = 'vIconerror';
                break;
            default:
                break;
        }

        return type === 'icon' ? result.icon : result.label;
    }
}

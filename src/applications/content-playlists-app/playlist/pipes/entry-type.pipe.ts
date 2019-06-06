import { Pipe, PipeTransform } from '@angular/core';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({name: 'entryType'})
export class EntryTypePipe implements PipeTransform {

    constructor(private appLocalization: AppLocalization) {
    }

    transform(value, isTooltip: boolean): string {
        let className = "";
        let tooltip = "";
        if (typeof(value) !== 'undefined' && value !== null) {
            switch (value) {
                case VidiunMediaType.video:
                    className = 'vIconvideo-small';
                    tooltip = this.appLocalization.get("applications.content.entryType.video");
                    break;
                case VidiunMediaType.image:
                    tooltip = this.appLocalization.get("applications.content.entryType.image");
                    className = 'vIconimage-small';
                    break;
                case VidiunMediaType.audio:
                    tooltip = this.appLocalization.get("applications.content.entryType.audio");
                    className = 'vIconsound-small';
                    break;
                case VidiunMediaType.liveStreamFlash:
                case VidiunMediaType.liveStreamQuicktime:
                case VidiunMediaType.liveStreamRealMedia:
                case VidiunMediaType.liveStreamWindowsMedia:
                    tooltip = this.appLocalization.get("applications.content.entryType.live");
                    className = 'vIconlive_transcoding';
                    break;
                default:
                    tooltip = this.appLocalization.get("applications.content.entryType.unknown");
                    className = 'vIconfile-small';
                    break;
            }
        }
        if (isTooltip) {
            return tooltip;
        } else {
            return className;
        }
    }
}

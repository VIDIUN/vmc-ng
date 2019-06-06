import { Pipe, PipeTransform } from '@angular/core';
import { VidiunConversionProfileType } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({
  name: 'vTranscodingProfileType'
})
export class TranscodingProfileTypePipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: VidiunConversionProfileType, icon: boolean): string {
    if (!value) {
      return '';
    }

    let result = {
      icon: '',
      label: ''
    };

    switch (true) {
      case value === VidiunConversionProfileType.media:
        result = {
          icon: 'vIcontranscoding',
          label: this._appLocalization.get('applications.settings.transcoding.type.media')
        };
        break;

      case value === VidiunConversionProfileType.liveStream:
        result = {
          icon: 'vIconlive_transcoding',
          label: this._appLocalization.get('applications.settings.transcoding.type.live')
        };
        break;

      default:
        break;
    }

    return icon ? result.icon : result.label;
  }

}

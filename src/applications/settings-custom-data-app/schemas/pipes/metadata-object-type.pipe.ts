import { Pipe, PipeTransform } from '@angular/core';
import { VidiunMetadataObjectType } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({ name: 'vMetadataObjectType' })
export class MetadataObjectTypePipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {

  }

  transform(value: VidiunMetadataObjectType): string {
    if (value) {
      if (value === VidiunMetadataObjectType.entry) {
        return this._appLocalization.get('applications.settings.metadata.applyTo.entries');
      }

      if (value === VidiunMetadataObjectType.category) {
        return this._appLocalization.get('applications.settings.metadata.applyTo.categories');
      }
    }

    return '';
  }
}

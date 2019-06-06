import { Pipe, PipeTransform } from '@angular/core';
import { MetadataItemTypes } from 'shared/vmc-shared/custom-metadata/metadata-profile';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({ name: 'vCustomSchemaTypePipe' })
export class CustomSchemaTypePipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {

  }

  transform(value: MetadataItemTypes, mode: 'icon' | 'label'): string {
    const result = { icon: '', label: '' };

    switch (value) {
      case MetadataItemTypes.Object:
        result.icon = 'vIconcheckbox';
        result.label = this._appLocalization.get('applications.settings.metadata.type.object');
        break;

      case MetadataItemTypes.Date:
        result.icon = 'vIcondate-and-time';
        result.label = this._appLocalization.get('applications.settings.metadata.type.date');
        break;

      case MetadataItemTypes.List:
        result.icon = 'vIconList';
        result.label = this._appLocalization.get('applications.settings.metadata.type.list');
        break;

      case MetadataItemTypes.Text:
        result.icon = 'vIconinput-field';
        result.label = this._appLocalization.get('applications.settings.metadata.type.text');
        break;

      default:
        break;

    }

    return mode === 'icon' ? result.icon : result.label;
  }
}

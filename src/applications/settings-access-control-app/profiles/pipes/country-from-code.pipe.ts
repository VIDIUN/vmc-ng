import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({ name: 'vCountryFromCode' })

export class CountryFromCodePipe implements PipeTransform {

  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: string, type: 'icon' | 'label'): string {
    if (!value) {
      return value;
    }

    const countryCode = value.toLowerCase();

    return type === 'icon'
      ? `vFlag-${countryCode}`
      : this._appLocalization.get(`countries.${countryCode}`);
  }
}

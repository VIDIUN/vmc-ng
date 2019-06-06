import {Component, Input} from '@angular/core';
import {BrowserService} from 'app-shared/vmc-shell';
import {AppAuthentication, AppUser} from 'app-shared/vmc-shell';
import { vmcAppConfig } from '../../vmc-app-config';
import {PopupWidgetComponent} from '@vidiun-ng/vidiun-ui';
import { Router } from '@angular/router';

@Component({
  selector: 'vVMCUserSettings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  @Input() parentPopup: PopupWidgetComponent;
  public _languages = [];
  public _dateFormats = [
      { value: 'month-day-year', label: 'MM/DD/YYYY' },
      { value: 'day-month-year', label: 'DD/MM/YYYY' },
  ];
  public _selectedLanguage = 'en';
  public _selectedDateFormat = this.browserService.getFromLocalStorage('vmc_date_format') || 'month-day-year';

  constructor(public _userAuthentication: AppAuthentication, private browserService: BrowserService, private _router: Router) {
      vmcAppConfig.locales.forEach(locale => {
      this._languages.push({label: locale.label, value: locale.id});
    });

    const currentLang = this.browserService.getFromLocalStorage('vmc_lang');
    if (currentLang && currentLang.length) {
      const lang = this._languages.find((lang) => {
        return lang.value === currentLang
      });
      if (lang) {
        this._selectedLanguage = lang.value;
      }
    }
  }

  logout() {
    this._userAuthentication.logout();
  }

  onLangSelected(event) {
    this.browserService.setInLocalStorage('vmc_lang', event.value);
    this._userAuthentication.reload();
  }

  onDateFormatSelected(event: { value: string }): void {
      this.browserService.setInLocalStorage('vmc_date_format', event.value);
      this._userAuthentication.reload();
  }

    egg(){
        this._router.navigateByUrl(vmcAppConfig.routing.errorRoute, { replaceUrl: true });
    }

}

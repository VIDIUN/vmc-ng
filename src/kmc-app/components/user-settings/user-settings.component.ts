import {Component, Input} from '@angular/core';
import {BrowserService} from 'app-shared/kmc-shell';
import {AppAuthentication, AppUser} from 'app-shared/kmc-shell';
import { kmcAppConfig } from '../../kmc-app-config';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kKMCUserSettings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  @Input() parentPopup: PopupWidgetComponent;
  public _userContext: AppUser;
  public _languages = [];
  public _selectedLanguage = 'en';

  constructor(private userAuthentication: AppAuthentication, private browserService: BrowserService) {
    this._userContext = userAuthentication.appUser;

      kmcAppConfig.locales.forEach(locale => {
      this._languages.push({label: locale.label, value: locale.id});
    });

    const currentLang = this.browserService.getFromLocalStorage('kmc_lang');
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
    this.userAuthentication.logout();
  }

  onLangSelected(event) {
    this.browserService.setInLocalStorage('kmc_lang', event.value);
    this.userAuthentication.reload();
  }

}

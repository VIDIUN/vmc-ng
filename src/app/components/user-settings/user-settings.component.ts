import { Component } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppAuthentication, AppUser, PartnerPackageTypes, AppNavigator } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
	selector: 'kKMCUserSettings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
	timeoutID: number = null;
	public _userContext: AppUser;
	public _languages = [];
	public _selectedLanguage = "en";

	constructor(private userAuthentication: AppAuthentication, private appNavigator: AppNavigator, private browserService: BrowserService) {
		this._userContext = userAuthentication.appUser;

		environment.core.locales.forEach(locale => {
			this._languages.push({label: locale.label, value: locale.id});
		});

		const currentLang = this.browserService.getFromLocalStorage('kmc_lang');
		if (currentLang && currentLang.length){
			const lang = this._languages.find((lang) => {return lang.value === currentLang});
			if (lang){
				this._selectedLanguage = lang.value;
			}
		}
	}

	logout() {
		this.userAuthentication.logout();
		//this.appNavigator.navigateToLogout();
		document.location.reload();
	}

	openUserManual() {
		this.browserService.openLink(environment.core.externalLinks.USER_MANUAL, {}, '_blank');
	}

	openSupport() {
		// check if this is a paying partner. If so - open support form. If not - redirect to general support. Use MD5 to pass as a parameter.
		let payingCustomer: boolean = this._userContext.partnerInfo.partnerPackage === PartnerPackageTypes.PartnerPackagePaid;
		let params = {
			'type': Md5.hashStr(payingCustomer.toString()),
			'pid': this._userContext.partnerId
		};

		// TODO [kmc] Open support in a modal window over KMC and not in _blank
		this.browserService.openLink(environment.core.externalLinks.SUPPORT, params, '_blank');
	}

	onLangSelected(event){
		this.browserService.setInLocalStorage('kmc_lang', event.value);
		location.reload();
	}

}

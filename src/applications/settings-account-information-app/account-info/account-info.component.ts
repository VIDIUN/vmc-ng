import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsAccountInformationService} from '../settings-account-information.service';
import { AppAuthentication, BrowserService, PartnerPackageTypes } from 'app-shared/vmc-shell';
import {VidiunPartnerStatistics} from 'vidiun-ngx-client';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { SettingsAccountInformationMainViewService } from 'app-shared/vmc-shared/vmc-views';
import { serverConfig } from 'config/server';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { DatePipe } from 'app-shared/vmc-shared/date-format/date.pipe';

@Component({
  selector: 'vAccountInfo',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  providers: [VidiunLogger.createLogger('AccountInfoComponent')]
})
export class AccountInfoComponent implements OnInit, OnDestroy {
  public _isBusy = false;
  public _bandwidth = '';
  public _bandwidthNA = false;
  public _storage = '';
  public _storageNA = false;
  public _showTrialUserInfo: boolean;
  public _trialExpirationDateString = '';

  constructor(private _accountInformationService: SettingsAccountInformationService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization,
              private _logger: VidiunLogger,
              private _browserService: BrowserService,
              private _settingsAccountInformationMainView: SettingsAccountInformationMainViewService) {
  }

  ngOnInit() {
    this._logger.info(`initiate accont information view`);
    this._showTrialUserInfo = this._appAuthentication.appUser.partnerInfo.partnerPackage === PartnerPackageTypes.PartnerPackageFree
        && serverConfig.vidiunServer.freeTrialExpiration
        && !!this._appAuthentication.appUser.createdAt;
    if (this._showTrialUserInfo) {
      const trialPeriod: number = serverConfig.vidiunServer.freeTrialExpiration.trialPeriodInDays;

      this._trialExpirationDateString =
        (new DatePipe(this._browserService)).transform(this._appAuthentication.appUser.createdAt.getTime() + trialPeriod, 'dateOnly'); // "01/15/1992"
    }
    if (this._settingsAccountInformationMainView.isAvailable()) {
        this.loadStatistics();
    }
  }

  private loadStatistics() {
    this._logger.info(`handle loading statistics data`);
    this._isBusy = true;
    this._accountInformationService.getStatistics()
      .pipe(cancelOnDestroy(this))
      .subscribe((response: VidiunPartnerStatistics) => {
        this._isBusy = false;
        this._bandwidthNA = typeof response.bandwidth !== 'number';
        this._storageNA = typeof response.hosting !== 'number';
        this._bandwidth = !this._bandwidthNA ? response.bandwidth.toFixed(2) : this._appLocalization.get('app.common.n_a');
        this._storage = !this._storageNA ? response.hosting.toFixed(2) : this._appLocalization.get('app.common.n_a');
        this._logger.info(`handle successful loading statistics data`, { bandwidth: this._bandwidth, storage: this._storage });
      }, error => {
        this._logger.warn(`handle failed loading statistics data`, { errorMessage: error.message });
        this._isBusy = false;
          this._bandwidthNA = true;
          this._storageNA = true;
        this._bandwidth = this._appLocalization.get('app.common.n_a');
        this._storage = this._appLocalization.get('app.common.n_a');
      });
  }

  ngOnDestroy() {
  }
}

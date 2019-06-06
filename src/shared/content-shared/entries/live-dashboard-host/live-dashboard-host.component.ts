import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService} from 'app-shared/vmc-shell';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import {getVidiunServerUri, serverConfig} from 'config/server';
import { LiveDashboardAppViewService } from 'app-shared/vmc-shared/vmc-views/component-views';

@Component({
  selector: 'vLiveDashboardHost',
  templateUrl: './live-dashboard-host.component.html',
  styleUrls: ['./live-dashboard-host.component.scss']
})
export class LiveDashboardHostComponent implements OnInit, OnDestroy {

  @Input()
  entryId: string = null;
  public _liveDashboardUrl = null;

  constructor(private appAuthentication: AppAuthentication,
              private logger: VidiunLogger,
              private _browserService: BrowserService,
              private _liveDasboardAppViewService: LiveDashboardAppViewService) {
  }

  ngOnInit() {
    if (!this.entryId) {
      this.logger.warn('Could not load live dashboard for provided entry, no entry id was provided');
      return undefined;
    }

    if (!this._liveDasboardAppViewService.isAvailable()) {
      this.logger.warn('Could not load live dashboard for provided entry, live dashboard not enabled for partner');
      return undefined;
    }

    try {
      this._liveDashboardUrl = serverConfig.externalApps.liveDashboard.uri;

      const currentLang = this._browserService.getFromLocalStorage('vmc_lang');
      window['lang'] = currentLang || 'en';
      window['vmc'] = {
        'vars': {
          'vs': this.appAuthentication.appUser.vs,
          'service_url': getVidiunServerUri(),
          'liveDashboard': {
            'entryId': this.entryId
          }
        }
      };
    } catch (ex) {
      this.logger.warn(`Could not load live dashboard, please check that live dashboard configurations are loaded correctly\n error: ${ex}`);
      this._liveDashboardUrl = null;
      window['vmc'] = null;
      window['lang'] = null;
    }
  }

  ngOnDestroy() {
    this._liveDashboardUrl = null;
    window['vmc'] = null;
    window['lang'] = null;
  }

}

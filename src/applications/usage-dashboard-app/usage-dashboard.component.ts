import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService } from 'app-shared/vmc-shell';
import {getVidiunServerUri, serverConfig} from 'config/server';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { UsageDashboardMainViewService } from 'app-shared/vmc-shared/vmc-views';

@Component({
  selector: 'vUsageDashboard',
  templateUrl: './usage-dashboard.component.html',
  styleUrls: ['./usage-dashboard.component.scss']
})
export class UsageDashboardComponent implements OnInit, OnDestroy {

  public _usageDashboardUrl = null;

  constructor(private appAuthentication: AppAuthentication,
              private logger: VidiunLogger,
              private browserService: BrowserService,
              private _usageDashboardMainView: UsageDashboardMainViewService) {
  }

  ngOnInit() {
    try {
      if (this._usageDashboardMainView.viewEntered()) { // Deep link when disabled handling
          this._usageDashboardUrl = serverConfig.externalApps.usageDashboard.uri;
          window['vmc'] = {
              'vars': {
                  'vs': this.appAuthentication.appUser.vs,
                  'partner_id': this.appAuthentication.appUser.partnerId,
                  'service_url': getVidiunServerUri()
              }
          };
      }
    } catch (ex) {
      this.logger.warn(`Could not load usage dashboard, please check that usage dashboard configurations are loaded correctly\n error: ${ex}`);
      this._usageDashboardUrl = null;
      window['vmc'] = null;
    }
  }


  ngOnDestroy() {
    this._usageDashboardUrl = null;
    window['vmc'] = null;
  }
}

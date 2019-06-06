import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService} from 'app-shared/vmc-shell';
import {serverConfig} from 'config/server';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { KavaAppMainViewService } from 'app-shared/vmc-shared/vmc-views';

@Component({
  selector: 'vAnalyticsLive',
  templateUrl: './analytics-kava.component.html',
  styleUrls: ['./analytics-kava.component.scss'],
  providers: []
})
export class AnalyticsKavaComponent implements OnInit, OnDestroy {

  public appUrl: string;

  constructor(private appAuthentication: AppAuthentication,
              private logger: VidiunLogger,
              private browserService: BrowserService,
              private _kavaAppViewService: KavaAppMainViewService) {
  }

  ngOnInit() {
    try {
      if (this._kavaAppViewService.viewEntered()) { // Deep link when disabled handling
          this.appUrl = `${serverConfig.externalApps.kava.uri}?vs=${this.appAuthentication.appUser.vs}`;
      }
    } catch (ex) {
      this.logger.warn(`Could not load kava, please check that kava configurations are loaded correctly\n error: ${ex}`);
      this.appUrl = null;
    }
  }


  ngOnDestroy() {
    this.appUrl = null;
  }

}

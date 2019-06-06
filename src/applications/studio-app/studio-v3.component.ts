import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {AppAuthentication, BrowserService } from 'app-shared/vmc-shell';
import {AppEventsService} from 'app-shared/vmc-shared';
import { buildCDNUrl, getVidiunServerUri, serverConfig } from 'config/server';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { PlayersUpdatedEvent } from 'app-shared/vmc-shared/events';
import { VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { StudioV3MainViewService } from 'app-shared/vmc-shared/vmc-views';

@Component({
  selector: 'vStudioV3',
  templateUrl: './studio-v3.component.html',
  styleUrls: ['./studio-v3.component.scss']
})
export class StudioV3Component implements OnInit, AfterViewInit, OnDestroy {

  public studioUrl = '';

  constructor(
        private _cdr: ChangeDetectorRef,
        private appAuthentication: AppAuthentication,
        private _appEvents: AppEventsService, private logger: VidiunLogger,
        private browserService: BrowserService,
        private _permissionsService: VMCPermissionsService,
        private _studioV3MainView: StudioV3MainViewService) {
  }

  ngOnInit() {
       if (this._studioV3MainView.viewEntered()) {
           window['vmc'] = {
               'preview_embed': {
                   'updateList': (isPlaylist: boolean) => {
                       this._updatePlayers(isPlaylist);
                   }
               },
               'vars': {
                   'vs': this.appAuthentication.appUser.vs,
                   'api_url': getVidiunServerUri(),
                   'host': serverConfig.vidiunServer.uri,
                   'studioV3': {
                       'config': {
                           'name': 'Video Studio V3',
                           'tags': 'studio_v3',
                           'html5_version': serverConfig.externalApps.studioV3.html5_version,
                           'html5lib': buildCDNUrl(serverConfig.externalApps.studioV3.html5lib)
                       },
                       'publisherEnvType': this.appAuthentication.appUser.partnerInfo.publisherEnvironmentType,
                       'html5_version': serverConfig.externalApps.studioV3.html5_version,
                       'showFlashStudio': false,
                       'showHTMLStudio': false,
                       'playerVersionsMap': serverConfig.externalApps.studioV3.playerVersionsMap
                   }
               },
               'functions': {}
           };
           this.studioUrl = serverConfig.externalApps.studioV3.uri;
       }
  }

  ngAfterViewInit() {
  }

  _updatePlayers(isPlaylist): void {
    this._appEvents.publish(new PlayersUpdatedEvent(isPlaylist));
  }

  ngOnDestroy() {
    this.studioUrl = '';
    window['vmc'] = null;
  }
}

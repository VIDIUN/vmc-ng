import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {AppAuthentication, BrowserService } from 'app-shared/vmc-shell';
import {AppEventsService} from 'app-shared/vmc-shared';
import { buildCDNUrl, getVidiunServerUri, serverConfig } from 'config/server';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { PlayersUpdatedEvent } from 'app-shared/vmc-shared/events';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { StudioV3MainViewService, StudioV2MainViewService } from 'app-shared/vmc-shared/vmc-views';

@Component({
  selector: 'vStudioV2',
  templateUrl: './studio-v2.component.html',
  styleUrls: ['./studio-v2.component.scss']
})
export class StudioV2Component implements OnInit, AfterViewInit, OnDestroy {

    public studioUrl = '';

    constructor(
                private appAuthentication: AppAuthentication,
                private _appEvents: AppEventsService, private logger: VidiunLogger,
                private browserService: BrowserService,
                private _studioV2MainView: StudioV2MainViewService) {
    }

    ngOnInit() {
        if (this._studioV2MainView.viewEntered()) {
            window['vmc'] = {
                'preview_embed': {
                    'updateList': (isPlaylist: boolean) => {
                        this._updatePlayers(isPlaylist);
                    }
                },
                'vars': {
                    'vs': this.appAuthentication.appUser.vs,
                    'api_url': getVidiunServerUri(),
                    'studio': {
                        'config': {
                            'name': 'Video Studio V2',
                            'tags': 'studio_v2',
                            'html5_version': serverConfig.externalApps.studioV2.html5_version,
                            'html5lib': buildCDNUrl(serverConfig.externalApps.studioV2.html5lib)
                        },
                        'showFlashStudio': false,
                        'showStudioV3': false,
                    },
                    'functions': {}
                }
            };
            this.studioUrl = serverConfig.externalApps.studioV2.uri;
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

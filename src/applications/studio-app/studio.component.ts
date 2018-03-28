import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService, UnpermittedActionReasons} from 'app-shared/kmc-shell';
import {AppEventsService} from 'app-shared/kmc-shared';
import {getKalturaServerUri, serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { PlayersUpdatedEvent } from 'app-shared/kmc-shared/events';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'kStudio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent implements OnInit, AfterViewInit, OnDestroy {

  public studioUrl = '';

  constructor(private appAuthentication: AppAuthentication, private _appEvents: AppEventsService, private logger: KalturaLogger, private browserService: BrowserService, private _permissionsService: KMCPermissionsService) {
  }

  ngOnInit() {
    try {
      if (!serverConfig.externalApps.studio.enabled) { // Deep link when disabled handling
        this.browserService.handleUnpermittedAction(UnpermittedActionReasons.InvalidConfiguration)
        return undefined;
      }
      window['kmc'] = {
        'version': '3',
        'preview_embed': {
          'updateList': (isPlaylist: boolean) => {
            this._updatePlayers(isPlaylist)
          }
        },
        'vars': {
          'ks': this.appAuthentication.appUser.ks,
          'api_url': getKalturaServerUri(),
          'studio':{
            'config': {
              'version': serverConfig.externalApps.studio.version,
              'name': 'Video Studio V2',
              'tags': 'studio_v2',
              'html5_version': serverConfig.externalApps.studio.html5_version,
              'html5lib': serverConfig.externalApps.studio.html5lib
            },
            'showFlashStudio': false,
            'showStudioV3': this._permissionsService.hasPermission(KMCPermissions.FEATURE_V3_STUDIO_PERMISSION),
            'uiConfID': +serverConfig.externalApps.studio.uiConfId,
            'version': serverConfig.externalApps.studio.version
          },
          'studioV3':{
            'config': {
              'version': serverConfig.externalApps.studioV3.version,
              'name': 'Video Studio V3',
              'tags': 'studio_v3',
              'html5_version': serverConfig.externalApps.studioV3.html5_version,
              'html5lib': serverConfig.externalApps.studioV3.html5lib
            },
            'publisherEnvType': this.appAuthentication.appUser.partnerInfo.publisherEnvironmentType,
            'html5_version': serverConfig.externalApps.studioV3.html5_version,
            'showFlashStudio': false,
            'showHTMLStudio': this._permissionsService.hasPermission(KMCPermissions.FEATURE_SHOW_HTML_STUDIO),
            'uiConfID': +serverConfig.externalApps.studioV3.uiConfId,
            'version': serverConfig.externalApps.studioV3.version
          }
        },
        'functions':{
          'openStudioV3': () => {
            if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_V3_STUDIO_PERMISSION)){
              this._openV3Studio();
            }
          },
          'openStudio': () => {
            if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_SHOW_HTML_STUDIO)) {
              this._openV2Studio();
            }
          }
        }
      }
      if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_SHOW_HTML_STUDIO)) {
        this._openV2Studio();
      }else if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_V3_STUDIO_PERMISSION)){
        this._openV3Studio();
      }
    } catch (ex) {
      this.logger.warn(`Could not load Studio, please check that Studio configurations are loaded correctly\n error: ${ex}`);
      this.studioUrl = null;
      window['kmc'] = null;
    }
  }

  ngAfterViewInit() {
  }

  _updatePlayers(isPlaylist): void {
    this._appEvents.publish(new PlayersUpdatedEvent(isPlaylist));
  }

  ngOnDestroy() {
    this.studioUrl = '';
    window['kmc'] = null;
  }

  private _openV2Studio(){
    this.studioUrl = serverConfig.externalApps.studio.uri;
  }

  private _openV3Studio(){
    this.studioUrl = serverConfig.externalApps.studioV3.uri;
  }

}

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges} from '@angular/core';
import {AppAuthentication} from 'app-shared/vmc-shell/auth';
import {getVidiunServerUri, serverConfig} from 'config/server';
import {VMCPermissions, VMCPermissionsService} from 'app-shared/vmc-shared/vmc-permissions';
import {UpdateClipsEvent} from 'app-shared/vmc-shared/events/update-clips-event';
import {AppEventsService} from 'app-shared/vmc-shared/app-events';
import {
    AdvertisementsAppViewService,
    ClipAndTrimAppViewService,
    QuizAppViewService,
    HotspotsAppViewService
} from 'app-shared/vmc-shared/vmc-views/component-views';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { ContentEntryViewService } from 'app-shared/vmc-shared/vmc-views/details-views';
import { ContentEntryViewSections } from 'app-shared/vmc-shared/vmc-views/details-views/content-entry-view.service';
import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunLiveEntry } from 'vidiun-ngx-client';
import { VidiunMediaType } from 'vidiun-ngx-client';


@Component({
  selector: 'vVeditHoster',
  templateUrl: './vedit-hoster.component.html',
  styleUrls: ['./vedit-hoster.component.scss'],
    providers: [
        VidiunLogger.createLogger('VeditHosterComponent')
    ]
})
export class VeditHosterComponent implements OnInit, OnDestroy, OnChanges {

  @Input() entry: VidiunMediaEntry | VidiunLiveEntry = null;
  @Input() tab: 'quiz' | 'editor' | 'advertisements' | 'hotspots' = null;
    @Input() entryHasSource = false;

  @Output() enteredDraftMode = new EventEmitter<void>();
  @Output() exitDraftMode = new EventEmitter<void>();
    @Output() closeEditor = new EventEmitter<void>();


  public veditUrl: string;
  public _windowEventListener = null;
  public _veditConfig: any = null;

  constructor(private _appAuthentication: AppAuthentication,
              private _contentEntryViewService: ContentEntryViewService,
              private _advertisementsAppViewService: AdvertisementsAppViewService,
              private _clipAndTrimAppViewService: ClipAndTrimAppViewService,
              private _quizAppViewService: QuizAppViewService,
              private _hotspotsAppViewService: HotspotsAppViewService,
              private _permissionService: VMCPermissionsService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _logger: VidiunLogger,
              private _appEvents: AppEventsService,
              ) {
  }

  ngOnChanges() {
      this._updateState();
  }

  ngOnInit() {
      this._windowEventListener = (e) => {
          let postMessageData;
          try {
              postMessageData = e.data;
          } catch (ex) {
              return;
          }

          /* request for init params,
		  * should return a message where messageType = vea-config */
          if (postMessageData.messageType === 'vea-bootstrap') {
              e.source.postMessage(this._veditConfig, e.origin);
          }


          /* request for user display name.
		  * message.data = {userId}
		  * should return a message {messageType:vea-display-name, data: display name}
		  */
          if (postMessageData.messageType === 'vea-get-display-name') {
              // send the user's display name based on the user ID
              const displayName = this._appAuthentication.appUser.fullName;
              e.source.postMessage({
                  'messageType': 'vea-display-name',
                  'data': displayName
              }, e.origin);
          }

          /* received when a clip was created.
				* postMessageData.data: {
				*  originalEntryId,
				*  newEntryId,
				*  newEntryName
				* }
				* should return a message where message.messageType = vea-clip-message,
				* and message.data is the (localized) text to show the user.
				* */
          if (postMessageData.messageType === 'vea-clip-created') {
              this._appEvents.publish(new UpdateClipsEvent());

              // send a message to VEA which will show up after clip has been created.
              const message = 'Clip was successfully created.';
              e.source.postMessage({
                  'messageType': 'vea-clip-message',
                  'data': message
              }, e.origin);
          }


          /*
		  * Fired when modifying advertisements (save not performed yet).
		  * message.data = {entryId}
		  */
          if (postMessageData.messageType === 'vea-advertisements-modified') {
              this.enteredDraftMode.emit();
          }

          /*
		   * Fired when saving advertisements
		   * message.data = {entryId}
		   */
          if (postMessageData.messageType === 'vea-advertisements-saved') {
              this.exitDraftMode.emit();
          } else if (postMessageData.messageType === 'vea-go-to-media') {
              this.closeEditor.emit();
              this._contentEntryViewService.openById(postMessageData.data, ContentEntryViewSections.Metadata);
          }

          /* request for user vs.
		  * message.data = {userVS}
		  * should return a message {messageType:vea-vs, data: vs}
		  */
          if (postMessageData.messageType === 'vea-get-vs') {
              // send the user's display name based on the user ID
              const vs = this._appAuthentication.appUser.vs;
              e.source.postMessage({
                  'messageType': 'vea-vs',
                  'data': vs
              }, e.origin);
          }
      };
  }

  private _removePostMessagesListener(): void {
      window.removeEventListener('message', this._windowEventListener);
  }

  private _addPostMessagesListener() {
      this._removePostMessagesListener();
      window.addEventListener('message', this._windowEventListener);
  }

  private _updateState(): void {
      if (!this.entry || !this.tab) {
          this._logger.info('remove vedit application since some required data is missing', {
              hasEntry: !!this.entry,
              hasTab: !!this.tab
          });
          this.veditUrl = null;
          this._veditConfig = null;
          this._removePostMessagesListener();
          return;
      }

      setTimeout(() => {
          this._logger.info('initialize vedit application', {tab: this.tab});

          this.veditUrl = null;
          this._veditConfig = null;

          const serviceUrl = getVidiunServerUri();
          const tabs = {};
          const clipAndTrimAvailable = this._clipAndTrimAppViewService.isAvailable({
              entry: this.entry,
              hasSource: this.entryHasSource
          });
          const advertismentsAvailable = this._advertisementsAppViewService.isAvailable({
              entry: this.entry,
              hasSource: this.entryHasSource
          });
          const quizAvailable = this._quizAppViewService.isAvailable({
              entry: this.entry,
              hasSource: this.entryHasSource
          });
          const hotspotsAvailable = this._hotspotsAppViewService.isAvailable({
              entry: this.entry,
              hasSource: this.entryHasSource
          });

          if (clipAndTrimAvailable) {
              this._logger.debug('clip&trim views are available, add configuration for tabs: edit, quiz');
              const clipAndTrimPermissions = [];
              if (this._permissionService.hasAnyPermissions([
                  VMCPermissions.CONTENT_INGEST_INTO_READY,
                  VMCPermissions.CONTENT_INGEST_REPLACE])
              ) {
                  clipAndTrimPermissions.push('trim');
              }

              if (this._permissionService.hasPermission(VMCPermissions.CONTENT_INGEST_CLIP_MEDIA)) {
                  clipAndTrimPermissions.push('clip');
              }

              Object.assign(tabs, {
                  'edit': {
                      name: 'edit',
                      permissions: clipAndTrimPermissions,
                      userPermissions: clipAndTrimPermissions
                  }
              });
          }

          if (advertismentsAvailable) {
              this._logger.debug('advertisements view is available, add configuration for tabs: advertisements');
              tabs['advertisements'] = {
                  name: 'advertisements',
                  permissions: ['FEATURE_ALLOW_VAST_CUE_POINT_NO_URL', 'CUEPOINT_MANAGE', 'FEATURE_DISABLE_VMC_VDP_ALERTS']
                      .filter(permission => this._permissionService.hasPermission(VMCPermissions[permission])),
                  userPermissions: []
              };
          }

          if (quizAvailable) {
              this._logger.debug('quiz view is available, add configuration for tabs: quiz');
              tabs['quiz'] = {
                  name: 'quiz',
                  permissions: ['quiz'],
                  userPermissions: ['quiz']
              };
          }

          if (hotspotsAvailable) {
              this._logger.debug('hotspots view is available, add configuration for tabs: hotspots');
              tabs['hotspots'] = {
                  name: 'hotspots',
              };
          }

          let requestedTabIsNotAvailable = false;
          let veditUrl = null;
          switch (this.tab) {
              case 'quiz':
                  if (quizAvailable) {
                      veditUrl = serverConfig.externalApps.editor.uri;
                  } else {
                      requestedTabIsNotAvailable = true;
                  }
                  break;
              case 'editor':
                  if (clipAndTrimAvailable) {
                      veditUrl = serverConfig.externalApps.editor.uri;
                  } else {
                      requestedTabIsNotAvailable = true;
                  }
                  break;
              case 'advertisements':
                  if (advertismentsAvailable) {
                      veditUrl = serverConfig.externalApps.editor.uri;
                  } else {
                      requestedTabIsNotAvailable = true;
                  }
                  break;
              case 'hotspots':
                  if (hotspotsAvailable) {
                      veditUrl = serverConfig.externalApps.editor.uri;
                  } else {
                      requestedTabIsNotAvailable = true;
                  }
                  break;
              default:
                  veditUrl = null;
                  break;
          }


          if (veditUrl) {
              this._logger.debug('show vedit application', {veditUrl: veditUrl, tab: this.tab});
              const isLiveEntry = [
                  VidiunMediaType.liveStreamFlash,
                  VidiunMediaType.liveStreamWindowsMedia,
                  VidiunMediaType.liveStreamRealMedia,
                  VidiunMediaType.liveStreamQuicktime
              ].indexOf(this.entry.mediaType) !== -1;
              const entryId = isLiveEntry ? (<VidiunLiveEntry>this.entry).recordedEntryId : this.entry.id;
              this.veditUrl = veditUrl;
              this._veditConfig = {
                  'messageType': 'vea-config',
                  'data': {
                      /* URL of the Vidiun Server to use */
                      'service_url': serviceUrl,

                      /* the partner ID to use */
                      'partner_id': this._appAuthentication.appUser.partnerId,

                      /* Vidiun session key to use */
                      'vs': this._appAuthentication.appUser.vs,

                      /* language - used by priority:
					  * 1. Custom locale (locale_url)
					  *       full url of a json file with translations
					  * 2. Locale code (language_code
					  *       there should be a matching json file under src\assets\i18n)
					  * 3. English default locale (fallback). */
                      'language_code': 'en',
                      'locale_url': '',

                      /* URL to be used for "Go to User Manual" in VEdit help component */
                      'help_link': 'https://knowledge.vidiun.com/node/1912',

                      /* tabs to show in navigation */
                      'tabs': tabs,

                      /* tab to start current session with, should match one of the keys above  */
                      'tab': this.tab,

                      /* URL of an additional css file to load */
                      'css_url': '',

                      /* id of the entry to start with */
                      'entry_id': entryId,

                      /* should a VS be appended to the thumbnails url, for access control issues */
                      'load_thumbnail_with_vs': false,

                      /* should hide the navigation bar (sidebar holding the tabs) */
                      'hide_navigation_bar': false
                  }
              };
              this._addPostMessagesListener();
          } else {
              this._logger.warn('abort initialization of vedit application, missing required parameters', {
                  requestedTabIsNotAvailable,
                  tab: this.tab
              });
          }
      });
  }


  ngOnDestroy() {
    this._removePostMessagesListener();
  }

}

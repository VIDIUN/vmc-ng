import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { AreaBlockerMessage, VidiunPlayerComponent } from '@vidiun-ng/vidiun-ui';
import { ModerationStore } from '../moderation-store/moderation-store.service';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { Router } from '@angular/router';
import { AppAuthentication, BrowserService } from 'app-shared/vmc-shell';
import { BulkService } from '../bulk-service/bulk.service';
import { EntriesStore } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { EntryReportSections } from './entry-report-sections';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { VidiunModerationFlag } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunSourceType } from 'vidiun-ngx-client';
import { VidiunEntryStatus } from 'vidiun-ngx-client';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { Observer } from 'rxjs/Observer';
import { serverConfig, getVidiunServerUri } from 'config/server';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/vmc-shared/vmc-views/details-views';
import { ISubscription } from 'rxjs/Subscription';

export interface Tabs {
  name: string;
  isActive: boolean;
  disabled: boolean;
}

@Component({
  selector: 'vEntryReport',
  templateUrl: './entry-report.component.html',
  styleUrls: ['./entry-report.component.scss'],
  providers: [ModerationStore]
})

export class EntryReportComponent implements OnInit, OnDestroy {

    public _vmcPermissions = VMCPermissions;
  @ViewChild('player') player: VidiunPlayerComponent;

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() entryId: string;

  private _isRecordedLive = false;
  private _userId = '';

  public serverUri = getVidiunServerUri();
  public _areaBlockerMessage: AreaBlockerMessage = null;
  public _tabs: Tabs[] = [];
  public _flags: VidiunModerationFlag[] = null;
  public _entry: VidiunMediaEntry = null;
  public _hasDuration = false;
  public _isEntryReady = false;
  public _isClip = false;
  public _flagsAmount = '';
  public EntryReportSections = EntryReportSections;
  public _playerConfig : any = {};
  public _isBusy = false;
  public _isEntryLinkAvailable = false;

  constructor(public _moderationStore: ModerationStore,
              private _appLocalization: AppLocalization,
              private _router: Router,
              private _browserService: BrowserService,
              private _bulkService: BulkService,
              private appAuthentication: AppAuthentication,
              private _contentEntryViewService: ContentEntryViewService,
              private _permissionsService: VMCPermissionsService,
              private _entriesStore: EntriesStore) {
  }

  ngOnInit() {
    this._loadEntryModerationDetails();
    this._playerConfig = {
      uiconfid: serverConfig.vidiunServer.previewUIConf,
      pid: this.appAuthentication.appUser.partnerId,
      entryid: this.entryId,
      flashvars: {'closedCaptions': { 'plugin': true }, 'vs': this.appAuthentication.appUser.vs}
    };

    const shouldDisableAlerts = this._permissionsService.hasPermission(VMCPermissions.FEATURE_DISABLE_VMC_VDP_ALERTS);
    if (shouldDisableAlerts) {
      this._playerConfig.flashvars['disableAlerts'] = true;
    }
  }

  ngOnDestroy() {
  }

  private _getObserver(retryFn: () => void): Observer<any> {
    return {
      next: () => {
        this._closePopup();
        this._entriesStore.reload();
        this._areaBlockerMessage = null;
      },
      error: (error) => {
        this._areaBlockerMessage = new AreaBlockerMessage({
          message: error.message,
          buttons: [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._areaBlockerMessage = null;
                retryFn();
              }
            },
            {
              label: this._appLocalization.get('app.common.cancel'),
              action: () => {
                this._areaBlockerMessage = null;
              }
            }
          ]
        });
      },
      complete: () => {
        // empty by design
      }
    };
  }

  private _doApproveEntry(): void {
    const retryFn = () => this._doApproveEntry();
    this._areaBlockerMessage = null;
    this._bulkService.approveEntry([this._entry.id])
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(this._getObserver(retryFn));
  }

  private _doRejectEntry(): void {
    const retryFn = () => this._doRejectEntry();
    this._areaBlockerMessage = null;
    this._bulkService.rejectEntry([this._entry.id])
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(this._getObserver(retryFn));
  }

  private _loadEntryModerationDetails(): void {
    this._isBusy = true;
    this._tabs = [
      { name: this._appLocalization.get('applications.content.moderation.report'), isActive: false, disabled: false },
      { name: this._appLocalization.get('applications.content.moderation.details'), isActive: false, disabled: false }
    ];
    this._moderationStore.loadEntryModerationDetails(this.entryId)
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          this._isBusy = false;
          this._areaBlockerMessage = null;
          if (response.entry && response.flag) {
            this._entry = response.entry;
            this._isEntryLinkAvailable = this._contentEntryViewService.isAvailable({entry: this._entry, section: ContentEntryViewSections.Metadata});
            this._flags = response.flag.objects;
            const moderationCount = this._entry.moderationCount;
            this._flagsAmount = moderationCount === 1
              ? this._appLocalization.get('applications.content.moderation.flagSingular', { 0: moderationCount })
              : this._appLocalization.get('applications.content.moderation.flagPlural', { 0: moderationCount });
            this._userId = this._entry.userId;

            if (this._entry.moderationCount > 0) {
              this._tabs[EntryReportSections.Report].isActive = true;
            } else {
              this._tabs[EntryReportSections.Details].isActive = true;
              this._tabs[EntryReportSections.Report].disabled = true;
            }

            if (this._entry.sourceType) {
              const sourceType = this._entry.sourceType.toString();
              const isLive = (sourceType === VidiunSourceType.liveStream.toString() ||
                sourceType === VidiunSourceType.akamaiLive.toString() ||
                sourceType === VidiunSourceType.akamaiUniversalLive.toString() ||
                sourceType === VidiunSourceType.manualLiveStream.toString());
              this._hasDuration = this._entry.status !== VidiunEntryStatus.noContent
                && !isLive
                && this._entry.mediaType.toString() !== VidiunMediaType.image.toString();
              this._isEntryReady = this._entry.status.toString() === VidiunEntryStatus.ready.toString();
              if (isLive) {
                this._playerConfig['flashvars']['disableEntryRedirect'] = true;
              }
              this._isRecordedLive = (sourceType === VidiunSourceType.recordedLive.toString());
              this._isClip = !this._isRecordedLive && (this._entry.id !== this._entry.rootEntryId);
            }
            this.player.Embed();
          }
        },
        error => {
          this._isBusy = false;
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._areaBlockerMessage = null;
                  this._loadEntryModerationDetails();
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._closePopup();
                  this._areaBlockerMessage = null;
                }
              }
            ]
          });
        }
      );
  }

  public _closePopup(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }

  public _changeTab(index: number): void {
    if (!this._tabs[index].disabled) {
      this._tabs.forEach(tab => tab.isActive = false);
      this._tabs[index].isActive = true;
    }
  }

  public _navigateToEntry(entryId): void {
      this._contentEntryViewService.openById(entryId, ContentEntryViewSections.Metadata);
  }

  public _banCreator(): void {
    this._moderationStore.banCreator(this._userId)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
          this._browserService.alert({
              header: this._appLocalization.get('app.common.attention'),
            message: this._appLocalization.get('applications.content.moderation.notificationHasBeenSent')
          });
        },
        error => {
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._areaBlockerMessage = null;
                  this._banCreator();
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._areaBlockerMessage = null;
                }
              }
            ]
          });
        }
      );
  }

  public _approveEntry(): void {
    if (this._permissionsService.hasPermission(VMCPermissions.FEATURE_VMC_VERIFY_MODERATION)) {
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.moderation.approveMedia'),
        message: this._appLocalization.get('applications.content.moderation.sureToApprove', { 0: this._entry.name }),
        accept: () => this._doApproveEntry()
      });
    } else {
      this._doApproveEntry();
    }
  }

  public _rejectEntry(): void {
    if (this._permissionsService.hasPermission(VMCPermissions.FEATURE_VMC_VERIFY_MODERATION)) {
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.moderation.rejectMedia'),
        message: this._appLocalization.get('applications.content.moderation.sureToReject', { 0: this._entry.name }),
        accept: () => this._doRejectEntry()
      });
    } else {
      this._doRejectEntry();
    }
  }
}

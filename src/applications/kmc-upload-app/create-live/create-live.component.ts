import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CreateLiveService} from './create-live.service';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {VidiunRecordStatus} from 'vidiun-ngx-client';
import {AreaBlockerMessage} from '@vidiun-ng/vidiun-ui';
import {BrowserService} from 'app-shared/vmc-shell';
import {PopupWidgetComponent, PopupWidgetStates} from '@vidiun-ng/vidiun-ui';
import {VidiunLive} from './vidiun-live-stream/vidiun-live-stream.interface';
import {ManualLive} from './manual-live/manual-live.interface';
import {UniversalLive} from './universal-live/universal-live.interface';
import { VidiunLiveStreamEntry } from 'vidiun-ngx-client';
import { VidiunSourceType } from 'vidiun-ngx-client';
import { AppEventsService } from 'app-shared/vmc-shared';
import { UpdateEntriesListEvent } from 'app-shared/vmc-shared/events/update-entries-list-event';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/vmc-shared/vmc-views/details-views';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export enum StreamTypes {
  vidiun,
  universal,
  manual
}

@Component({
  selector: 'vCreateLive',
  templateUrl: './create-live.component.html',
  styleUrls: ['./create-live.component.scss'],
  providers: [CreateLiveService]
})
export class CreateLiveComponent implements OnInit, OnDestroy, AfterViewInit {
  private _showConfirmationOnClose = true;

  public _selectedStreamType: StreamTypes = StreamTypes.vidiun;
  public vidiunLiveStreamData: VidiunLive = {
    name: '',
    description: '',
    transcodingProfile: null,
    liveDVR: false,
    enableRecording: this._permissionsService.hasPermission(VMCPermissions.FEATURE_LIVE_STREAM_RECORD),
    enableRecordingSelectedOption: VidiunRecordStatus.appended,
    previewMode: false
  };
  public manualLiveData: ManualLive = {
    name: '',
    description: '',
    flashHDSURL: '',
    hlsStreamUrl: '',
    useAkamaiHdProtocol: false
  };
  public universalLiveData: UniversalLive = {
    name: '',
    description: '',
    primaryEncoderIp: '',
    secondaryEncoderIp: '',
    broadcastPassword: '',
    liveDvr: false
  };
  public _availableStreamTypes: Array<{ id: string, value: StreamTypes, label: string }>;
  public _streamTypes = StreamTypes;
  public _blockerMessage: AreaBlockerMessage;
  public _manualStreamOnly = false;

  @ViewChild('vidiunLiveStreamComponent') vidiunLiveStreamComponent;
  @ViewChild('manualLiveComponent') manualLiveComponent;
  @ViewChild('universalLiveComponent') universalLiveComponent;
  @Input() parentPopupWidget: PopupWidgetComponent;

  constructor(private createLiveService: CreateLiveService,
              private _appLocalization: AppLocalization,
              private _appEvents: AppEventsService,
              private _browserService: BrowserService,
              private _permissionsService: VMCPermissionsService,
              private _contentEntryViewService: ContentEntryViewService) {
  }

  ngOnInit() {
    this._availableStreamTypes = [
      {
        id: 'vidiun',
        value: StreamTypes.vidiun,
        label: this._appLocalization.get('applications.upload.prepareLive.streamTypes.vidiun')
      },
      {
        id: 'universal',
        value: StreamTypes.universal,
        label: this._appLocalization.get('applications.upload.prepareLive.streamTypes.universal')
      },
      {
        id: 'manual',
        value: StreamTypes.manual,
        label: this._appLocalization.get('applications.upload.prepareLive.streamTypes.manual')
      }
    ];

    this._permissionsService.filterList(
      this._availableStreamTypes,
      {
        'vidiun': VMCPermissions.FEATURE_VIDIUN_LIVE_STREAM,
        'universal': VMCPermissions.FEATURE_VMC_AKAMAI_UNIVERSAL_LIVE_STREAM_PROVISION
      }
    );

    if (this._availableStreamTypes.length === 1) {
      this._manualStreamOnly = true;
      this._selectedStreamType = StreamTypes.manual;
    }
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
        .pipe(cancelOnDestroy(this))
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._showConfirmationOnClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose) {
              if (this._isCurrentSelectedFormDirty() && this._showConfirmationOnClose) {
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.addNewPlaylist.cancelEdit'),
                    message: this._appLocalization.get('applications.content.addNewPlaylist.discard'),
                    accept: () => {
                      this._showConfirmationOnClose = false;
                      this.parentPopupWidget.close();
                    }
                  }
                );
              }
            }
          }
        });
    }
  }

  ngOnDestroy() {
  }

  submitCurrentSelectedForm() {
    switch (this._selectedStreamType) {
      case StreamTypes.vidiun: {
        this._submitVidiunLiveStreamData();
        break;
      }
      case StreamTypes.universal: {
        this._submitUniversalLiveStreamData();
        break;
      }
      case StreamTypes.manual: {
        this._submitManualLiveStreamData();
        break;
      }
      default: {
        // add error message for trying to submit unsupported form type
        this._blockerMessage = new AreaBlockerMessage({
          title: 'Cannot create stream',
          message: 'Unsupported stream type, please select different stream type from the \'Stream type\' select menu',
          buttons: [{
            label: this._appLocalization.get('app.common.confirm'),
            action: () => {
              this._blockerMessage = null;
            }
          }]
        });
        break;
      }
    }
  }

  private _isCurrentSelectedFormDirty(): boolean {
    switch (this._selectedStreamType) {
      case StreamTypes.vidiun: {
        return this.vidiunLiveStreamComponent.isFormDirty();
      }
      case StreamTypes.universal: {
        return this.universalLiveComponent.isFormDirty();
      }
      case StreamTypes.manual: {
        return this.manualLiveComponent.isFormDirty();
      }
      default: {
        return false;
      }
    }
  }


  private _confirmEntryNavigation(liveStream: VidiunLiveStreamEntry): void {
    const header = this._appLocalization.get('applications.upload.prepareLive.confirmEntryNavigation.title');

    switch (liveStream.sourceType) {
      case VidiunSourceType.liveStream:
        this._browserService.confirm({
          header,
          message: this._appLocalization.get('applications.upload.prepareLive.confirmEntryNavigation.vidiunMessage'),
          accept: () => {
              this._contentEntryViewService.open({
                  entry: liveStream,
                  section: ContentEntryViewSections.Metadata,
                  reloadEntriesListOnNavigateOut: true
              });
            this._showConfirmationOnClose = false;
            this.parentPopupWidget.close();
          },
          reject: () => {
            this._showConfirmationOnClose = false;
            this._appEvents.publish(new UpdateEntriesListEvent());
            this.parentPopupWidget.close();
          }
        });
        break;

      case VidiunSourceType.akamaiUniversalLive:
        this._browserService.alert({
          header,
          message: this._appLocalization.get('applications.upload.prepareLive.confirmEntryNavigation.universalMessage'),
          accept: () => {
            this._showConfirmationOnClose = false;
            this._appEvents.publish(new UpdateEntriesListEvent());
            this.parentPopupWidget.close();
          }
        });
        break;

      case VidiunSourceType.manualLiveStream:
        this._browserService.alert({
          header,
          message: this._appLocalization.get(
            'applications.upload.prepareLive.confirmEntryNavigation.manualMessage',
            [liveStream.id]
          ),
          accept: () => {
            this._showConfirmationOnClose = false;
            this._appEvents.publish(new UpdateEntriesListEvent());
            this.parentPopupWidget.close();
          }
        });
        break;

      default:
        this._browserService.alert({
          header,
          message: this._appLocalization.get('applications.upload.prepareLive.confirmEntryNavigation.generalMessage'),
          accept: () => {
            this._showConfirmationOnClose = false;
            this.parentPopupWidget.close();
          }
        });
        break;
    }
  }


  private _submitVidiunLiveStreamData() {
    if (this.vidiunLiveStreamComponent.validate()) {
      this.createLiveService.createVidiunLiveStream(this.vidiunLiveStreamData)
        .pipe(cancelOnDestroy(this))
        .pipe(tag('block-shell'))
        .subscribe(response => {
          this._confirmEntryNavigation(response);
        }, error => {
          this._blockerMessage = new AreaBlockerMessage({
            title: 'Error',
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('app.common.close'),
              action: () => {
                this._blockerMessage = null;
              }
            }]
          });
        });
    }
  }

  private _submitUniversalLiveStreamData() {
    if (this.universalLiveComponent.validate()) {
      this.createLiveService.createUniversalLiveStream(this.universalLiveData)
        .pipe(cancelOnDestroy(this))
        .pipe(tag('block-shell'))
        .subscribe(response => {
          this._confirmEntryNavigation(response);
        }, error => {
          this._blockerMessage = new AreaBlockerMessage({
            title: 'Error',
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('app.common.close'),
              action: () => {
                this._blockerMessage = null;
              }
            }]
          });
        });
    }
  }

  private _submitManualLiveStreamData() {
    if (this.manualLiveComponent.validate()) {
      this.createLiveService.createManualLiveStream(this.manualLiveData)
        .pipe(cancelOnDestroy(this))
        .pipe(tag('block-shell'))
        .subscribe(response => {
          this._confirmEntryNavigation(response);
        }, error => {
          this._blockerMessage = new AreaBlockerMessage({
            title: 'Error',
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('app.common.close'),
              action: () => {
                this._blockerMessage = null;
              }
            }]
          });
        });
    }
  }
}

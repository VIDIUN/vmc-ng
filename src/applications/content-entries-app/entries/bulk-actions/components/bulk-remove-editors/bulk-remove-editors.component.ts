import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ISubscription} from 'rxjs/Subscription';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {BrowserService} from 'app-shared/vmc-shell';
import {AreaBlockerMessage} from '@vidiun-ng/vidiun-ui';
import {PopupWidgetComponent, PopupWidgetStates} from '@vidiun-ng/vidiun-ui';
import {VidiunMediaEntry} from 'vidiun-ngx-client';
import {VidiunUser} from 'vidiun-ngx-client';

@Component({
  selector: 'vBulkRemoveEditors',
  templateUrl: './bulk-remove-editors.component.html',
  styleUrls: ['./bulk-remove-editors.component.scss']
})
export class BulkRemoveEditorsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() selectedEntries: VidiunMediaEntry[];
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() removeEditorsChanged = new EventEmitter<string[]>();

  public _loading = false;
  public _sectionBlockerMessage: AreaBlockerMessage;

  public users: VidiunUser[] = [];
  public usersToRemove: string[] = [];

  private _parentPopupStateChangeSubscribe: ISubscription;
  private _confirmClose = true;

  constructor(private _appLocalization: AppLocalization, private _browserService: BrowserService) {
  }

  ngOnInit() {
    const users = [];
    // create unique users array from all selected entries users
    this.selectedEntries.forEach(entry => {
      if (entry.entitledUsersEdit && entry.entitledUsersEdit.length) {
        const entryEditors = entry.entitledUsersEdit.split(',').map(editor => {
          return editor.trim();
        });
        entryEditors.forEach(editor => {
          if (users.indexOf(editor) === -1) {
            users.push(editor);
          }
        });
      }
    });
    this.users = users.sort();
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose) {
              if (this.usersToRemove.length && this._confirmClose) {
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
                    message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
                    accept: () => {
                      this._confirmClose = false;
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
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }

  public _removeUser(user: string) {
    this.usersToRemove.push(user);
  }


  public _apply() {
    this.removeEditorsChanged.emit(this.usersToRemove);
    this._confirmClose = false;
    this.parentPopupWidget.close();
  }
}


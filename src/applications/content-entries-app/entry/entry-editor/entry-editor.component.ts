import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import {PopupWidgetComponent} from '@vidiun-ng/vidiun-ui';
import {BrowserService} from 'app-shared/vmc-shell';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunMediaEntry } from 'vidiun-ngx-client';

@Component({
  selector: 'vEntryEditor',
  templateUrl: './entry-editor.component.html',
  styleUrls: ['./entry-editor.component.scss']
})
export class EntryEditorComponent implements OnInit, OnDestroy {

    @Input()
    tab: string = null;

  @Input()
  entry: VidiunMediaEntry = null;

    @Input() entryHasSource = false;

  @Input() parentPopupWidget: PopupWidgetComponent;

  public _confirmClose = false;

  constructor(private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public _close(): void {
    if (this._confirmClose) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.entryDetails.entryEditor.cancelEdit'),
          message: this._appLocalization.get('applications.content.entryDetails.entryEditor.discard'),
          accept: () => {
            this._confirmClose = false;
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          reject: () => {
          }
        }
      );
    } else {
      if (this.parentPopupWidget) {
        this.parentPopupWidget.close();
      }
    }
  }
}

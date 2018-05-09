import {Component, OnInit, ViewChild} from '@angular/core';
import { ConfirmationService, ConfirmDialog } from 'primeng/primeng';
import { BrowserService, GrowlMessage } from 'app-shared/kmc-shell/providers/browser.service';
import {AppLocalization, OperationTagManagerService} from '@kaltura-ng/kaltura-common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { KmcLoggerConfigurator } from 'app-shared/kmc-shell/kmc-logs/kmc-logger-configurator';
import { async } from 'rxjs/scheduler/async';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers : [ConfirmationService]
})
export class AppComponent implements OnInit {

  @ViewChild('confirm') private _confirmDialog: ConfirmDialog;
  @ViewChild('cd') private _alertDialog: ConfirmDialog;

  public _isBusy: boolean = false;
  public _growlMessages: GrowlMessage[] = [];

  constructor(private _confirmationService: ConfirmationService,
              private _browserService : BrowserService,
              private _appLocalization: AppLocalization,
              private router: Router,
              private _route: ActivatedRoute,
              private _loggerConfigurator: KmcLoggerConfigurator,
              private _oprationsTagManager: OperationTagManagerService
              ) {
  }

  ngOnInit() {
    this._browserService.registerOnShowConfirmation((message) =>
    {
      let htmlMessageContent = message.message.replace(/\n/g,'<br/>');
      const newMessage = Object.assign({}, message, { message : htmlMessageContent });
      this._confirmationService.confirm(newMessage);
      // fix for PrimeNG no being able to calculate the correct content height
      const dialog: ConfirmDialog = (message.key && message.key === 'confirm') ? this._confirmDialog : this._alertDialog;
      setTimeout(()=>{
        dialog.center();
      },0);
    });

    // scroll window to top upon navigation change
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
          window.scrollTo(0, 0);
        }
      });

    // handle app status: busy and error messages. Allow closing error window using the 'OK' button
    this._oprationsTagManager.tagStatus$
        .observeOn(async)
        .subscribe((tags: {[key: string]: number}) => {
            this._isBusy = tags['block-shell'] > 0;
        });

    // handle app growlMessages
    this._browserService.growlMessage$.subscribe(
      (message: GrowlMessage) => {
        this._growlMessages = [ ...this._growlMessages, message ];
      }
    );

      this._loggerConfigurator.init();
  }
}

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { BrowserService } from 'app-shared/vmc-shell';

import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { EntryLiveWidget } from './entry-live-widget.service';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';

import { serverConfig } from 'config/server';
import { LiveAnalyticsMainViewService } from 'app-shared/vmc-shared/vmc-views';

@Component({
    selector: 'vEntryLive',
    templateUrl: './entry-live.component.html',
    styleUrls: ['./entry-live.component.scss']
})
export class EntryLive implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild('liveAnalytics') _liveAnalytics: PopupWidgetComponent;

  public _vmcPermissions = VMCPermissions;
	public _copyToClipboardTooltips: { success: string, failure: string, idle: string, notSupported: string } = null;
	public enableLiveAnalytics: boolean = false;


	constructor(
	    public _widgetService: EntryLiveWidget,
        private _appLocalization: AppLocalization,
        private _browserService: BrowserService,
        private _liveAnalyticsView: LiveAnalyticsMainViewService
    ) {
		this._copyToClipboardTooltips = {
			success: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.success'),
			failure: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.failure'),
			idle: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.idle'),
			notSupported: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.notSupported')
		};
    }


    ngOnInit() {
		this._widgetService.attachForm();
		this.enableLiveAnalytics = this._liveAnalyticsView.isAvailable();
    }

    ngOnDestroy() {
		this._widgetService.detachForm();

	}


    ngAfterViewInit() {

    }


    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }

	_regenerateToken():void{
		this._browserService.confirm(
			{
				header: this._appLocalization.get('applications.content.entryDetails.live.regeneratePromptHeader'),
				message: this._appLocalization.get('applications.content.entryDetails.live.regeneratePrompt'),
				accept: () => {
					this._widgetService.regenerateStreamToken();
				}
			}
		);
	}

    public _openLiveAnalytics(): void {
        if (this.enableLiveAnalytics) {
            this._liveAnalytics.open();
        }
    }
}


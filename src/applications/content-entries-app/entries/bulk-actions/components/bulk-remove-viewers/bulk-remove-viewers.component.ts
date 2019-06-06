import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { VidiunClient, VidiunMediaEntry, VidiunUser } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { BrowserService } from 'app-shared/vmc-shell';
import { AreaBlockerMessage, PopupWidgetComponent, PopupWidgetStates } from '@vidiun-ng/vidiun-ui';

@Component({
    selector: 'vBulkRemoveViewers',
    templateUrl: './bulk-remove-viewers.component.html',
    styleUrls: ['./bulk-remove-viewers.component.scss']
})
export class BulkRemoveViewersComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() selectedEntries: VidiunMediaEntry[];
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Output() removeViewersChanged = new EventEmitter<string[]>();

    private _parentPopupStateChangeSubscribe: ISubscription;
    private _confirmClose = true;

    public _loading = false;
    public _sectionBlockerMessage: AreaBlockerMessage;

    public users: VidiunUser[] = [];
    public usersToRemove: string[] = [];

    constructor(private _vidiunServerClient: VidiunClient,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService) {
    }

    ngOnInit() {
        const users = [];
        // create unique users array from all selected entries users
        this.selectedEntries.forEach(entry => {
            if (entry.entitledUsersView && entry.entitledUsersView.length) {
                entry.entitledUsersView.split(',')
                    .forEach(viewer => {
                        viewer = viewer.trim();
                        if (users.indexOf(viewer) === -1) {
                            users.push(viewer);
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
        this.removeViewersChanged.emit(this.usersToRemove);
        this._confirmClose = false;
        this.parentPopupWidget.close();
    }
}


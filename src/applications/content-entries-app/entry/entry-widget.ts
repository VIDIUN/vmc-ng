import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { WidgetBase } from '@vidiun-ng/vidiun-ui';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@vidiun-ng/vidiun-ui';
import { EntryWidgetsManager } from './entry-widgets-manager';
import { VidiunMultiRequest } from 'vidiun-ngx-client';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

export abstract class EntryWidget extends WidgetBase<EntryWidgetsManager, VidiunMediaEntry, VidiunMultiRequest>
{
    public sectionBlockerMessage: AreaBlockerMessage;
    public showSectionLoader: boolean;

    constructor(private _widgetKey: string, logger: VidiunLogger)
    {
        super(_widgetKey, logger);
    }

    protected _showLoader() {
	    this._removeBlockerMessage();
        this.showSectionLoader = true;
    }

    protected _hideLoader() {
        this.showSectionLoader = false;
    }

    protected _removeBlockerMessage() : void{
        this.sectionBlockerMessage = null;
    }

    protected _showBlockerMessage(message: AreaBlockerMessage, addBackToEntriesButton: boolean) {
        let messageToShow = message;
        if (addBackToEntriesButton) {
            messageToShow = new AreaBlockerMessage({
                message: message.message,
                buttons: [
                    ...this._createBackToEntriesButton(),
                    ... message.buttons
                ]
            })
        }
        ;

        this.showSectionLoader = false;
        this.sectionBlockerMessage = messageToShow;
    }

    protected _createBackToEntriesButton(): AreaBlockerMessageButton[] {
        if (this.form) {
            return [{
                label: 'Back To Entries',
                action: () => {
                    this.form.returnToEntries();
                }
            }];
        }else
        {
            return [{
                label: 'dismiss',
                action: () => {
                    this._removeBlockerMessage();
                }
            }];
        }
    }

    protected _showActivationError(message?: string) {
        this._showBlockerMessage(new AreaBlockerMessage(
            {
                message: message || 'An error occurred while loading data',
                buttons: [
                    {
                        label: 'Retry',
                        action: () => {
                            this.activate();
                        }
                    }
                ]
            }
        ), true);
    }
}

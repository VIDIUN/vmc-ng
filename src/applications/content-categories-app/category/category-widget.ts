import { VidiunCategory } from 'vidiun-ngx-client';
import { WidgetBase } from '@vidiun-ng/vidiun-ui';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@vidiun-ng/vidiun-ui';
import { CategoryWidgetsManager } from './category-widgets-manager';
import { VidiunMultiRequest } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';


export abstract class CategoryWidget extends WidgetBase<CategoryWidgetsManager, VidiunCategory, VidiunMultiRequest> {
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

    protected _removeBlockerMessage() : void {
        this.sectionBlockerMessage = null;
    }

    protected _showBlockerMessage(message: AreaBlockerMessage, addBackToCategoriesButton: boolean) {
        let messageToShow = message;
        if (addBackToCategoriesButton) {
            messageToShow = new AreaBlockerMessage({
                message: message.message,
                buttons: [
                    ...this._createBackToCategoriesButton(),
                    ... message.buttons
                ]
            });
        };

        this.showSectionLoader = false;
        this.sectionBlockerMessage = messageToShow;
    }

    protected _createBackToCategoriesButton(): AreaBlockerMessageButton[] {
        if (this.form instanceof CategoryWidgetsManager)
        {
            return [{
                label: 'Back to Categories',
                action: () => {
                    (<CategoryWidgetsManager>this.form).returnToCategories();
                }
            }];
        }else
        {
            return [];
        }

    }

    protected _showActivationError(message?: string) {
        this._showBlockerMessage(new AreaBlockerMessage(
            {
                message: message || 'An error occurred while loading data.',
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

    protected _showUserError(message?: string) {
        this._showBlockerMessage(new AreaBlockerMessage(
            {
                message: message || 'Category owner cannot be found (deleted?)',
                buttons: [
                    {
                        label: 'OK',
                        action: () => {
                            this.sectionBlockerMessage = null;
                            this._hideLoader();
                        }
                    }
                ]
            }
        ), false);
    }
}

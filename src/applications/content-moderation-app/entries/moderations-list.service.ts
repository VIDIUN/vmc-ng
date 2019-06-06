import { Injectable } from '@angular/core';

import { BrowserService } from 'app-shared/vmc-shell/providers/browser.service';
import { ContentModerationMainViewService } from 'app-shared/vmc-shared/vmc-views';

@Injectable()
export class ModerationsListService {

    private _isViewAvailable: boolean;
    public get isViewAvailable(): boolean {
        return this._isViewAvailable;
    }

    constructor(contentModerationMainView: ContentModerationMainViewService,
                browserService: BrowserService) {
        this._isViewAvailable = contentModerationMainView.isAvailable();
    }
}

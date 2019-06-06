import { Injectable } from '@angular/core';
import { ContentEntriesMainViewService } from 'app-shared/vmc-shared/vmc-views';

@Injectable()
export class EntriesListService {

    private _isViewAvailable: boolean;
    public get isViewAvailable(): boolean {
        return this._isViewAvailable;
    }

    constructor(contentEntriesMainView: ContentEntriesMainViewService) {
        this._isViewAvailable = contentEntriesMainView.isAvailable();
    }
}

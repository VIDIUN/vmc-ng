import { Injectable, OnDestroy } from '@angular/core';
import { KMCPermissions, KMCPermissionsService } from '../../kmc-permissions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import { KmcDetailsViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import { modulesConfig } from 'config/modules';
import {KalturaMediaEntry} from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { ContentCategoriesMainViewService } from '../main-views/content-categories-main-view.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

export interface ContentNewCategoryViewArgs {
    entries: KalturaMediaEntry[];
}


@Injectable()
export class ContentNewCategoryViewService extends KmcDetailsViewBaseService<ContentNewCategoryViewArgs> implements OnDestroy {

    private _newCategoryData: ContentNewCategoryViewArgs;
    private _logger: KalturaLogger;

    constructor(private _appPermissions: KMCPermissionsService,
                logger: KalturaLogger,
                private _contentCategoriesMainView: ContentCategoriesMainViewService,
                private _router: Router) {
        super();
        this._logger = logger.subLogger('ContentNewCategoryViewService');

    }

    isAvailable(args: ContentNewCategoryViewArgs): boolean {
        return true;
    }

    protected _open(args: ContentNewCategoryViewArgs): Observable<boolean> {
        return Observable.create(observer => {
            this._logger.info('handle open new category view request by the user', {entriesCount: (args.entries || []).length});
            this._newCategoryData = args;

            this._contentCategoriesMainView.openWithState()
                .cancelOnDestroy(this)
                .catch((error, caught) => {
                    return Observable.of(false);
                })
                .subscribe(
                    result => {
                        if (!result) {
                            this._logger.warn('action aborted, cannot open categories view');
                            this._clearNewCategoryData();
                        }
                    }
                );
        });
    }

    public popNewCategoryData(): ContentNewCategoryViewArgs {
        const tempNewCategoryData = this._newCategoryData;

        if (tempNewCategoryData) {
            this._logger.info('provide information needed for creating the new category', {entriesCount: (tempNewCategoryData.entries || []).length});
            this._clearNewCategoryData();
        }

        return tempNewCategoryData;
    }

    private _clearNewCategoryData(): void {
        this._logger.debug('remove information provided by the user needed for creating the new category');
        this._newCategoryData = null;
    }

    ngOnDestroy() {
    }
}

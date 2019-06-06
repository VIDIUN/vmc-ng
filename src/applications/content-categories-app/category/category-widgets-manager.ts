import { VidiunCategory } from 'vidiun-ngx-client';
import { Injectable } from '@angular/core';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { WidgetsManagerBase } from '@vidiun-ng/vidiun-ui'
import { CategoryService } from './category.service';
import { VidiunMultiRequest } from 'vidiun-ngx-client';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';

@Injectable()
export class CategoryWidgetsManager extends WidgetsManagerBase<VidiunCategory, VidiunMultiRequest>
{
    private _categoryStore: CategoryService;

    constructor(logger: VidiunLogger) {
        super(logger.subLogger('CategoryWidgetsManager'));
    }

    set categoryStore(value: CategoryService) {
        this._categoryStore = value;
    }

    public returnToCategories(): void {
        if (this._categoryStore) {
            this._categoryStore.returnToCategories();
        }
    }
}

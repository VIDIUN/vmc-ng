import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { VidiunClient } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';

import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunCategoryEntry } from 'vidiun-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';
import { CategoryEntryListAction } from 'vidiun-ngx-client';

import { VidiunCategoryEntryFilter } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { CategoryEntryDeleteAction } from 'vidiun-ngx-client';
import { CategoriesSearchService, CategoryData } from 'app-shared/content-shared/categories/categories-search.service';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Injectable()
export class BulkRemoveCategoriesService extends BulkActionBaseService<number[]> implements OnDestroy {

    constructor(public _vidiunServerClient: VidiunClient,
                private _categoriesSearch: CategoriesSearchService,
                private _appLocalization: AppLocalization) {
        super(_vidiunServerClient);
    }

    private _getCategoryEntryMapping(entries: string[]): Observable<VidiunCategoryEntry[]> {

        if (entries.length === 0) {
            return Observable.throw(new Error('no entries were selected'));
        }
        // load all category entries
        const filter: VidiunCategoryEntryFilter = new VidiunCategoryEntryFilter(
            {
                entryIdIn: entries.join(',')
            }
        );

        const pager: VidiunFilterPager = new VidiunFilterPager();
        pager.pageIndex = 1;
        pager.pageSize = 1000;

        return this._vidiunServerClient.request(new CategoryEntryListAction({
            filter: filter,
            pager: pager
        }))
            .map(item => item.objects);
    }

    public getCategoriesOfEntries(entries: string[]): Observable<CategoryData[]> {
        return this._getCategoryEntryMapping(entries)
            .pipe(cancelOnDestroy(this))
            .switchMap(items => {
                // got all entry categories - load category details for each entry category
                if (items && items.length) {
                    const categoriesIds = Object.keys(items.reduce((acc, category) => {
                        acc[category.categoryId] = true; // remove duplications using hash map
                        return acc;
                    }, {})).map(Number);

                    return this._categoriesSearch.getCategories(categoriesIds)
                        .pipe(cancelOnDestroy(this))
                        .map(categoryListResponse => categoryListResponse.items)
                } else {
                    return Observable.of([]);
                }
            })
    }

    public execute(entries: VidiunMediaEntry[], categoriesId: number[]): Observable<{}> {
        return Observable.create(observer => {

            const entriesId = entries ? entries.map(entry => entry.id) : [];

            if (entriesId.length && categoriesId && categoriesId.length) {
                this._getCategoryEntryMapping(entriesId)
                    .pipe(cancelOnDestroy(this))
                    .subscribe(
                        categoriesOfEntries => {

                            if (categoriesOfEntries.length) {
                                const requests: CategoryEntryDeleteAction[] = [];

                                // send only categories that are set to each entry
                                entriesId.forEach(entryId => {
                                    categoriesId.forEach(categoryId => {
                                        if (this.categoryEntryExists(entryId, categoryId, categoriesOfEntries)) {
                                            requests.push(new CategoryEntryDeleteAction({
                                                entryId: entryId,
                                                categoryId: categoryId
                                            }));
                                        }
                                    });
                                });

                                this.transmit(requests, true).subscribe(
                                    result => {
                                        observer.next({})
                                        observer.complete();
                                    },
                                    error => {
                                        observer.error(error);
                                    }
                                );
                            } else {
                                observer.error(new Error('no categories found to be removed'));
                            }
                        },
                        error => {
                            observer.error(error);
                        }
                    );

            } else {
                observer.error(new Error('no categories or entries were selected'));
            }
        });
    }

    private categoryEntryExists(entryId: string, categoryId: number, entryCategories: VidiunCategoryEntry[]): boolean {
        let found = false;
        for (let i = 0; i < entryCategories.length; i++) {
            if (entryCategories[i].categoryId === categoryId && entryCategories[i].entryId === entryId) {
                found = true;
                break;
            }
        }
        return found;
    }

    ngOnDestroy() {
    }
}

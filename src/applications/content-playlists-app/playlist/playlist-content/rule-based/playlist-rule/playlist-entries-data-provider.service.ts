import { Injectable, OnDestroy } from '@angular/core';
import { VidiunBaseEntry } from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { VidiunDetachedResponseProfile } from 'vidiun-ngx-client';
import { VidiunMetadataSearchItem } from 'vidiun-ngx-client';
import { VidiunNullableBoolean } from 'vidiun-ngx-client';
import { VidiunSearchOperatorType } from 'vidiun-ngx-client';
import { VidiunSearchOperator } from 'vidiun-ngx-client';
import { VidiunSearchCondition } from 'vidiun-ngx-client';
import { VidiunContentDistributionSearchItem } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { VidiunResponseProfileType } from 'vidiun-ngx-client';
import { VidiunMediaEntryFilter } from 'vidiun-ngx-client';
import { VidiunUtils } from '@vidiun-ng/vidiun-common';
import { VidiunClient } from 'vidiun-ngx-client';
import {
  EntriesDataProvider, EntriesFilters, MetadataProfileData,
  SortDirection
} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { PlaylistExecuteFromFiltersAction } from 'vidiun-ngx-client';
import { VidiunMediaEntryFilterForPlaylist } from 'vidiun-ngx-client';
import { CategoriesModes } from 'app-shared/content-shared/categories/categories-mode-type';
import { subApplicationsConfig } from 'config/sub-applications';
import { MetadataProfileCreateModes, MetadataProfileStore, MetadataProfileTypes } from 'app-shared/vmc-shared';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
@Injectable()
export class PlaylistEntriesDataProvider implements EntriesDataProvider, OnDestroy {
  constructor(private _vidiunServerClient: VidiunClient,
              private _appPermissions: VMCPermissionsService,
              private _metadataProfileService: MetadataProfileStore) {
  }

  ngOnDestroy() {

  }

  private _updateFilterWithJoinedList(list: any[],
                                      requestFilter: VidiunMediaEntryFilter,
                                      requestFilterProperty: keyof VidiunMediaEntryFilter): void {
    const value = (list || []).map(item => item).join(',');

    if (value) {
      requestFilter[requestFilterProperty] = value;
    }
  }

  private _getMetadataProfiles(): Observable<MetadataProfileData[]> {
    return this._metadataProfileService.get({
      type: MetadataProfileTypes.Entry,
      ignoredCreateMode: MetadataProfileCreateModes.App
    })
      .pipe(cancelOnDestroy(this))
      .first()
      .map(metadataProfiles => {
        return metadataProfiles.items.map(metadataProfile => ({
          id: metadataProfile.id,
          name: metadataProfile.name,
          lists: (metadataProfile.items || []).map(item => ({ id: item.id, name: item.name }))
        }));
      });
  }

  public getServerFilter(data: EntriesFilters, mediaTypesDefault = true): Observable<VidiunMediaEntryFilterForPlaylist> {
    try {
      return this._getMetadataProfiles()
        .map(metadataProfiles => {
          // create request items
          const filter = new VidiunMediaEntryFilterForPlaylist({});

          const advancedSearch = filter.advancedSearch = new VidiunSearchOperator({});
          advancedSearch.type = VidiunSearchOperatorType.searchAnd;

          // filter 'freeText'
          if (data.freetext) {
            filter.freeText = data.freetext;
          }

          // filter 'createdAt'
          if (data.createdAt) {
            if (data.createdAt.fromDate) {
              filter.createdAtGreaterThanOrEqual = VidiunUtils.getStartDateValue(data.createdAt.fromDate);
            }

            if (data.createdAt.toDate) {
              filter.createdAtLessThanOrEqual = VidiunUtils.getEndDateValue(data.createdAt.toDate);
            }
          }

          // filters of joined list
          this._updateFilterWithJoinedList(data.mediaTypes, filter, 'mediaTypeIn');
          this._updateFilterWithJoinedList(data.durations, filter, 'durationTypeMatchOr');
          this._updateFilterWithJoinedList(data.replacementStatuses, filter, 'replacementStatusIn');
          this._updateFilterWithJoinedList(data.flavors, filter, 'flavorParamsIdsMatchOr');

          // filter 'distribution'
          if (data.distributions && data.distributions.length > 0) {
            const distributionItem = new VidiunSearchOperator({
              type: VidiunSearchOperatorType.searchOr
            });

            advancedSearch.items.push(distributionItem);

            data.distributions.forEach(item => {
              // very complex way to make sure the value is number (an also bypass both typescript and tslink checks)
              if (isFinite(+item) && parseInt(item) == <any>item) { // tslint:disable-line
                const newItem = new VidiunContentDistributionSearchItem(
                  {
                    distributionProfileId: +item,
                    hasEntryDistributionValidationErrors: false,
                    noDistributionProfiles: false
                  }
                );

                distributionItem.items.push(newItem)
              } else {
                // this._logger.warn(`cannot convert distribution value '${item}' into number. ignoring value`);
              }
            });
          }

          // filter 'originalClippedEntries'
          if (data.originalClippedEntries && data.originalClippedEntries.length > 0) {
            let originalClippedEntriesValue: VidiunNullableBoolean = null;

            data.originalClippedEntries.forEach(item => {
              switch (item) {
                case '0':
                  if (originalClippedEntriesValue == null) {
                    originalClippedEntriesValue = VidiunNullableBoolean.falseValue;
                  } else if (originalClippedEntriesValue === VidiunNullableBoolean.trueValue) {
                    originalClippedEntriesValue = VidiunNullableBoolean.nullValue;
                  }
                  break;
                case '1':
                  if (originalClippedEntriesValue == null) {
                    originalClippedEntriesValue = VidiunNullableBoolean.trueValue;
                  } else if (originalClippedEntriesValue === VidiunNullableBoolean.falseValue) {
                    originalClippedEntriesValue = VidiunNullableBoolean.nullValue;
                  }
                  break;
              }
            });

            if (originalClippedEntriesValue !== null) {
              filter.isRoot = originalClippedEntriesValue;
            }
          }

          // filters of custom metadata lists
          if (metadataProfiles && metadataProfiles.length > 0) {

            metadataProfiles.forEach(metadataProfile => {
              // create advanced item for all metadata profiles regardless if the user filtered by them or not.
              // this is needed so freetext will include all metadata profiles while searching.
              const metadataItem: VidiunMetadataSearchItem = new VidiunMetadataSearchItem({
                metadataProfileId: metadataProfile.id,
                type: VidiunSearchOperatorType.searchAnd,
                items: []
              });
              advancedSearch.items.push(metadataItem);

              metadataProfile.lists.forEach(list => {
                const metadataProfileFilters = data.customMetadata[list.id];
                if (metadataProfileFilters && metadataProfileFilters.length > 0) {
                  const innerMetadataItem: VidiunMetadataSearchItem = new VidiunMetadataSearchItem({
                    metadataProfileId: metadataProfile.id,
                    type: VidiunSearchOperatorType.searchOr,
                    items: []
                  });
                  metadataItem.items.push(innerMetadataItem);

                  metadataProfileFilters.forEach(filterItem => {
                    const searchItem = new VidiunSearchCondition({
                      field: `/*[local-name()='metadata']/*[local-name()='${list.name}']`,
                      value: filterItem
                    });

                    innerMetadataItem.items.push(searchItem);
                  });
                }
              });
            });
          }

          if (data.categories && data.categories.length) {
            const categoriesValue = data.categories.map(item => item).join(',');
            if (data.categoriesMode === CategoriesModes.SelfAndChildren) {
              filter.categoryAncestorIdIn = categoriesValue;
            } else {
              filter.categoriesIdsMatchOr = categoriesValue;
            }
          }

          // remove advanced search arg if it is empty
          if (advancedSearch.items && advancedSearch.items.length === 0) {
            delete filter.advancedSearch;
          }

          // handle default value for media types
          if (!filter.mediaTypeIn && mediaTypesDefault) {
            filter.mediaTypeIn = '1,2,5,6';
            if (this._appPermissions.hasPermission(VMCPermissions.FEATURE_LIVE_STREAM)) {
              filter.mediaTypeIn += ',201';
            }
          }

          // update the sort by args
          if (data.sortBy) {
            filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
          }

          filter.limit = data.limits && data.limits > 0 && data.limits <= subApplicationsConfig.contentPlaylistsApp.ruleBasedTotalResults
            ? data.limits
            : subApplicationsConfig.contentPlaylistsApp.ruleBasedTotalResults;

          // readonly filters for rule-based playlist
          filter.statusIn = '1,2';
          filter.typeIn = '1,7';
          filter.moderationStatusIn = '1,2,5,6';

          return filter;
        });
    } catch (err) {
      return Observable.throw(err);
    }
  }


  public executeQuery(data: EntriesFilters): Observable<{ entries: VidiunBaseEntry[], totalCount?: number }> {
    let pagination: VidiunFilterPager = null;
    // update desired fields of entries
    const responseProfile = new VidiunDetachedResponseProfile({
      type: VidiunResponseProfileType.includeFields,
      fields: 'id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status,startDate,endDate,moderationStatus,tags,categoriesIds,downloadUrl,sourceType,externalSourceType,capabilities'
    });

    // update pagination args
    if (data.pageIndex || data.pageSize) {
      pagination = new VidiunFilterPager(
        {
          pageSize: data.pageSize,
          pageIndex: data.pageIndex + 1
        }
      );
    }

    // build the request
    return <any>
      this.getServerFilter(data)
        .switchMap(filter => this._vidiunServerClient.request(
          new PlaylistExecuteFromFiltersAction({
            filters: [filter],
            totalResults: subApplicationsConfig.contentPlaylistsApp.ruleBasedTotalResults,
            pager: pagination
          }).setRequestOptions({
              responseProfile
          }))
        ).map(response => ({ entries: response, totalCount: response.length })
      );
  }

  public getDefaultFilterValues(savedAutoSelectChildren: CategoriesModes, pageSize: number): EntriesFilters {
    const categoriesMode = typeof savedAutoSelectChildren === 'number'
      ? savedAutoSelectChildren
      : CategoriesModes.SelfAndChildren;

    return {
      freetext: '',
      pageSize: pageSize,
      pageIndex: 0,
      sortBy: 'plays',
      sortDirection: SortDirection.Desc,
      createdAt: { fromDate: null, toDate: null },
      scheduledAt: { fromDate: null, toDate: null },
      mediaTypes: [],
      timeScheduling: [],
      ingestionStatuses: [],
      durations: [],
      originalClippedEntries: [],
      moderationStatuses: [],
      replacementStatuses: [],
      accessControlProfiles: [],
      flavors: [],
      distributions: [], categories: [],
      categoriesMode,
      customMetadata: {},
      limits: subApplicationsConfig.contentPlaylistsApp.ruleBasedTotalResults,
    };
  }
}

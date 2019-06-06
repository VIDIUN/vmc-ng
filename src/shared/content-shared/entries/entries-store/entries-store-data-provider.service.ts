import {Injectable, OnDestroy} from '@angular/core';
import {EntriesDataProvider, EntriesFilters, MetadataProfileData, SortDirection} from './entries-store.service';
import {VidiunBaseEntry} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import {VidiunDetachedResponseProfile} from 'vidiun-ngx-client';
import {VidiunMetadataSearchItem} from 'vidiun-ngx-client';
import {VidiunNullableBoolean} from 'vidiun-ngx-client';
import {VidiunSearchOperatorType} from 'vidiun-ngx-client';
import {VidiunSearchOperator} from 'vidiun-ngx-client';
import {VidiunSearchCondition} from 'vidiun-ngx-client';
import {VidiunContentDistributionSearchItem} from 'vidiun-ngx-client';
import {VidiunLiveStreamEntry} from 'vidiun-ngx-client';
import {VidiunExternalMediaEntry} from 'vidiun-ngx-client';
import {VidiunFilterPager} from 'vidiun-ngx-client';
import {VidiunResponseProfileType} from 'vidiun-ngx-client';
import {BaseEntryListAction} from 'vidiun-ngx-client';
import {VidiunMediaEntryFilter} from 'vidiun-ngx-client';
import {VidiunLiveStreamAdminEntry} from 'vidiun-ngx-client';
import {VidiunUtils} from '@vidiun-ng/vidiun-common';
import {VidiunClient} from 'vidiun-ngx-client';
import {CategoriesModes} from 'app-shared/content-shared/categories/categories-mode-type';
import {MetadataProfileCreateModes, MetadataProfileStore, MetadataProfileTypes} from 'app-shared/vmc-shared';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Injectable()
export class EntriesStoreDataProvider implements EntriesDataProvider, OnDestroy {
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

  public getServerFilter(data: EntriesFilters): Observable<VidiunMediaEntryFilter> {
    try {
      return this._getMetadataProfiles()
        .map(metadataProfiles => {
          // create request items
          const filter: VidiunMediaEntryFilter = new VidiunMediaEntryFilter({});
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
          this._updateFilterWithJoinedList(data.ingestionStatuses, filter, 'statusIn');
          this._updateFilterWithJoinedList(data.durations, filter, 'durationTypeMatchOr');
          this._updateFilterWithJoinedList(data.moderationStatuses, filter, 'moderationStatusIn');
          this._updateFilterWithJoinedList(data.replacementStatuses, filter, 'replacementStatusIn');
          this._updateFilterWithJoinedList(data.accessControlProfiles, filter, 'accessControlIdIn');
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

          // filter 'timeScheduling'
          if (data.timeScheduling && data.timeScheduling.length > 0) {
            data.timeScheduling.forEach(item => {
              switch (item) {
                case 'past':
                  if (filter.endDateLessThanOrEqual === undefined || filter.endDateLessThanOrEqual < (new Date())) {
                    filter.endDateLessThanOrEqual = (new Date());
                  }
                  break;
                case 'live':
                  if (filter.startDateLessThanOrEqualOrNull === undefined || filter.startDateLessThanOrEqualOrNull > (new Date())) {
                    filter.startDateLessThanOrEqualOrNull = (new Date());
                  }
                  if (filter.endDateGreaterThanOrEqualOrNull === undefined || filter.endDateGreaterThanOrEqualOrNull < (new Date())) {
                    filter.endDateGreaterThanOrEqualOrNull = (new Date());
                  }
                  break;
                case 'future':
                  if (filter.startDateGreaterThanOrEqual === undefined || filter.startDateGreaterThanOrEqual > (new Date())) {
                    filter.startDateGreaterThanOrEqual = (new Date());
                  }
                  break;
                case 'scheduled':
                  if (data.scheduledAt.fromDate) {
                    if (filter.startDateGreaterThanOrEqual === undefined
                      || filter.startDateGreaterThanOrEqual > (VidiunUtils.getStartDateValue(data.scheduledAt.fromDate))
                    ) {
                      filter.startDateGreaterThanOrEqual = (VidiunUtils.getStartDateValue(data.scheduledAt.fromDate));
                    }
                  }

                  if (data.scheduledAt.toDate) {
                    if (filter.endDateLessThanOrEqual === undefined
                      || filter.endDateLessThanOrEqual < (VidiunUtils.getEndDateValue(data.scheduledAt.toDate))
                    ) {
                      filter.endDateLessThanOrEqual = (VidiunUtils.getEndDateValue(data.scheduledAt.toDate));
                    }
                  }

                  break;
                default:
                  break
              }
            });
          }

          // filters of custom metadata lists
          if (metadataProfiles && metadataProfiles.length > 0) {

            metadataProfiles.forEach(metadataProfile => {
              // create advanced item for all metadata profiles regardless if the user filtered by them or not.
              // this is needed so freetext will include all metadata profiles while searching.
              const metadataItem: VidiunMetadataSearchItem = new VidiunMetadataSearchItem(
                {
                  metadataProfileId: metadataProfile.id,
                  type: VidiunSearchOperatorType.searchAnd,
                  items: []
                }
              );
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
          if (!filter.mediaTypeIn) {
	          filter.mediaTypeIn = '1,2,5,6';
	          if (this._appPermissions.hasPermission(VMCPermissions.FEATURE_LIVE_STREAM)) {
		          filter.mediaTypeIn += ',201';
	          }
          }

          // handle default value for statuses
          if (!filter.statusIn) {
            filter.statusIn = '-1,-2,0,1,2,7,4';
          }


          // update the sort by args
          if (data.sortBy) {
            filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
          }

          return filter;
        });
    } catch (err) {
      return Observable.throw(err);
    }
  }


  public executeQuery(data: EntriesFilters): Observable<{ entries: KalturaBaseEntry[], totalCount?: number }> {
    const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
      type: KalturaResponseProfileType.includeFields,
      fields: 'id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status,startDate,endDate,moderationStatus,moderationCount,tags,categoriesIds,downloadUrl,sourceType,entitledUsersPublish,entitledUsersView,entitledUsersEdit,externalSourceType,capabilities'
    });
    let pagination: VidiunFilterPager = null;

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
          new BaseEntryListAction({
            filter,
            pager: pagination,
          }).setRequestOptions({
                  responseProfile,
                  acceptedTypes: [VidiunLiveStreamAdminEntry, VidiunLiveStreamEntry, VidiunExternalMediaEntry]
              })
        )).map(response => ({ entries: response.objects, totalCount: response.totalCount })
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
      sortBy: 'createdAt',
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
      limits: 200,
    };
  }
}

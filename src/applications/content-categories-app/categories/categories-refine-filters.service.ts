import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/forkJoin';

import {KalturaClient} from 'kaltura-ngx-client';
import {
  MetadataItemTypes,
  MetadataProfile,
  MetadataProfileCreateModes,
  MetadataProfileStore,
  MetadataProfileTypes
} from 'app-shared/kmc-shared';

import {DefaultFiltersList} from './default-filters-list';

import * as R from 'ramda';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

export interface RefineGroupListItem {
  value: string,
  label: string
}

export class RefineGroupList {
  public items: RefineGroupListItem[] = [];

  constructor(public name: string,
              public label: string,
              public group?: string) {
  }
}

export interface RefineGroup {
  label: string;
  lists: RefineGroupList[];
}

@Injectable()
export class CategoriesRefineFiltersService {

  private _getRefineFilters$: Observable<RefineGroup[]>;

  constructor(private _kalturaServerClient: KalturaClient,
              private _permissionsService: KMCPermissionsService,
              private _metadataProfileStore: MetadataProfileStore,
              private _logger: KalturaLogger) {
      this._logger = _logger.subLogger('CategoriesRefineFiltersService');
  }

  public getFilters(): Observable<RefineGroup[]> {
    this._logger.info(`handle get categories refine filters request`);
    if (!this._getRefineFilters$) {
      // execute the request
      this._getRefineFilters$ = this._getMetadataFilters()
        .map(
          (response) => {
              this._logger.info(`handle successful get categories refine filters request, mapping response`);

            const result = [];
            if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_ENTITLEMENT)) {
              result.push(this._buildDefaultFiltersGroup());
            } else {
                this._logger.info(`user doesn't have FEATURE_ENTITLEMENT permission, ignore default filters group`);
            }

            if (response) {
                const metadataData = this._buildMetadataFiltersGroups(response.items);
                result.push(...metadataData.groups);
            } else {
                this._logger.info(`user doesn't have METADATA_PLUGIN_PERMISSION permission, ignore metadata filters group`);
            }

            return result;
          })
        .catch(err => {
          this._logger.warn(`failed to create refine filters`, { errorMessage: err.message });
          this._getRefineFilters$ = null;
          return Observable.throw(err);
        })
        .publishReplay(1)
        .refCount();
    }

    return this._getRefineFilters$;
  }

  private _getMetadataFilters(): Observable<{ items: MetadataProfile[] }> {
      if (this._permissionsService.hasPermission(KMCPermissions.METADATA_PLUGIN_PERMISSION)) {
          return this._metadataProfileStore.get({
              type: MetadataProfileTypes.Category,
              ignoredCreateMode: MetadataProfileCreateModes.App
          });
      }

      return Observable.of(null);
  }

  private _buildMetadataFiltersGroups(metadataProfiles: MetadataProfile[]): { metadataProfiles: number[], groups: RefineGroup[] } {

    const result: { metadataProfiles: number[], groups: RefineGroup[] } = {metadataProfiles: [], groups: []};

    metadataProfiles.forEach(metadataProfile => {
      result.metadataProfiles.push(metadataProfile.id);

      // get only fields that are list, searchable and has values
      const profileLists = R.filter(field => {
        return (field.type === MetadataItemTypes.List && field.isSearchable && field.optionalValues.length > 0);
      }, metadataProfile.items);

      // if found relevant lists, create a group for that profile
      if (profileLists && profileLists.length > 0) {
        const filterGroup = {label: metadataProfile.name, lists: []};
        result.groups.push(filterGroup);


        profileLists.forEach(list => {
          const group = new RefineGroupList(
            list.id,
            list.label,
            'customMetadata');

          filterGroup.lists.push(group);

          list.optionalValues.forEach(item => {
            group.items.push({
              value: item.value,
              label: item.text
            })

          });
        });
      }
    });

    return result;
  }

  private _buildDefaultFiltersGroup(): RefineGroup {
    const result: RefineGroup = {label: '', lists: []};

    // build constant filters
    DefaultFiltersList.forEach((defaultFilterList) => {
      const newRefineFilter = new RefineGroupList(
        defaultFilterList.name,
        defaultFilterList.label
      );
      result.lists.push(newRefineFilter);
      defaultFilterList.items.forEach((item: any) => {
        newRefineFilter.items.push({value: item.value, label: item.label});
      });

    });

    return result;
  }
}

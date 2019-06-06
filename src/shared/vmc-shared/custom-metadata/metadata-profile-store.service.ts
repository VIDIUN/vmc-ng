import { Injectable, OnDestroy } from '@angular/core';
import { PartnerProfileStore } from '../partner-profile';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/throw';
import { VidiunClient } from 'vidiun-ngx-client';
import { VidiunMetadataObjectType } from 'vidiun-ngx-client';
import { MetadataProfileListAction } from 'vidiun-ngx-client';
import { MetadataProfile } from './metadata-profile';
import { MetadataProfileParser } from './vidiun-metadata-parser';
import { VidiunMetadataProfileCreateMode } from 'vidiun-ngx-client';
import { VidiunMetadataProfileFilter } from 'vidiun-ngx-client';
import { VidiunMetadataProfileListResponse } from 'vidiun-ngx-client';
import { AppEventsService } from 'app-shared/vmc-shared/app-events';
import { MetadataProfileUpdatedEvent } from 'app-shared/vmc-shared/events/metadata-profile-updated.event';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export enum MetadataProfileCreateModes {
    Api,
    App,
    Vmc
}

export enum MetadataProfileTypes {
    Entry = 1,
    Category
}

export interface GetFilters
{
    type : MetadataProfileTypes;
    ignoredCreateMode : MetadataProfileCreateModes
}

@Injectable()
export class MetadataProfileStore extends PartnerProfileStore implements OnDestroy
{
    private _cachedProfiles : { [key : string] : MetadataProfile[]} = {};

    constructor(private _vidiunServerClient: VidiunClient,
                private _permissionsService: VMCPermissionsService,
                _appEvents: AppEventsService) {
        super();

        _appEvents.event(MetadataProfileUpdatedEvent)
          .pipe(cancelOnDestroy(this))
          .subscribe(() => {
            this._clearMetadataProfilesCache();
          })
    }

    ngOnDestroy() {

    }

    private _clearMetadataProfilesCache(): void {
      this._cachedProfiles = {};
    }

    public get(filters : GetFilters) : Observable<{items : MetadataProfile[]}>
    {
        if (!this._permissionsService.hasPermission(VMCPermissions.METADATA_PLUGIN_PERMISSION)) {
            return Observable.of({ items: [] });
        }

        return Observable.create(observer =>
        {
	        let sub: ISubscription;
            const cacheKey = this._createCacheKey(filters);
            const cachedResults = this._cachedProfiles[cacheKey];
            if (cachedResults)
            {
                observer.next({items : cachedResults});
                observer.complete();
            }else {
                    sub = this._buildGetRequest(filters).subscribe(
                    response =>
                    {
                    	sub = null;
                        const parser = new MetadataProfileParser();
                        const parsedProfiles = [];
                        let parseFirstError: Error = null;

                        response.objects.forEach(vidiunProfile =>
                        {
                            const parsedProfile = parser.parse(<any>vidiunProfile);
                            if (parsedProfile.error)
                            {
                                parseFirstError = parsedProfile.error;
                            }
                            else if (parsedProfile.profile)
                            {
                                parsedProfiles.push(parsedProfile.profile);
                            }
                        });

                        if (parseFirstError) {
                            observer.error(parseFirstError);
                        }else
                        {
                            this._cachedProfiles[cacheKey] = parsedProfiles;
                            observer.next({items: parsedProfiles});
                            observer.complete();
                        }
                    },
                    error =>
                    {
                    	sub = null;
                        observer.error(error);
                    }
                );
            }
            return () =>{
            	if (sub) {
		            sub.unsubscribe();
	            }
            }
        });

    }

    private _createCacheKey(filters : GetFilters)
    {
        if (filters) {
            return `_${filters.type ? filters.type : ''}_${filters.ignoredCreateMode ? filters.ignoredCreateMode : ''}_` ;
        } else {
            return 'all';
        }
    }

    private _getAPICreateMode(createMode : MetadataProfileCreateModes) : VidiunMetadataProfileCreateMode
    {
        let result : VidiunMetadataProfileCreateMode;

        switch (createMode)
        {
            case MetadataProfileCreateModes.Api:
                result = VidiunMetadataProfileCreateMode.api;
                break;
            case MetadataProfileCreateModes.App:
                result = VidiunMetadataProfileCreateMode.app;
                break;
            case MetadataProfileCreateModes.Vmc:
                result = VidiunMetadataProfileCreateMode.vmc;
                break;
            default:
        }

        return result;
    }

     private _buildGetRequest(filters: GetFilters): Observable<VidiunMetadataProfileListResponse> {
        const metadataProfilesFilter = new VidiunMetadataProfileFilter();
        metadataProfilesFilter.createModeNotEqual = this._getAPICreateMode(filters.ignoredCreateMode);
        metadataProfilesFilter.orderBy = '-createdAt';

        if (filters && filters.type && typeof filters.type !== 'undefined') {

            const filterType = filters.type;

            switch (filterType) {
                case MetadataProfileTypes.Entry:
                    metadataProfilesFilter.metadataObjectTypeEqual = VidiunMetadataObjectType.entry;
                    break;
                case MetadataProfileTypes.Category:
                    metadataProfilesFilter.metadataObjectTypeEqual = VidiunMetadataObjectType.category;
                    break;

            }
        }

        return <any>this._vidiunServerClient.request(new MetadataProfileListAction({
            filter: metadataProfilesFilter
        }));
    }
}

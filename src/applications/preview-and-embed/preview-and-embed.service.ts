import { Injectable } from '@angular/core';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaClient } from 'kaltura-ngx-client';
import { Observable } from 'rxjs/Observable';
import { UiConfListAction } from 'kaltura-ngx-client/api/types/UiConfListAction';
import { KalturaUiConfFilter } from 'kaltura-ngx-client/api/types/KalturaUiConfFilter';
import { KalturaUiConfListResponse } from 'kaltura-ngx-client/api/types/KalturaUiConfListResponse';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { ShortLinkAddAction } from 'kaltura-ngx-client/api/types/ShortLinkAddAction';
import { KalturaShortLink } from 'kaltura-ngx-client/api/types/KalturaShortLink';

@Injectable()
export class PreviewEmbedService {

	constructor(private _kalturaClient: KalturaClient) {
	}

	listPlayers(isPlaylist: boolean = false): Observable<KalturaUiConfListResponse>{

		const tags = isPlaylist ? 'html5studio,playlist' : 'html5studio,player';

		const filter = new KalturaUiConfFilter({
			'tagsMultiLikeAnd': tags,
			'orderBy': '-updatedAt',
			'objTypeIn': '1,8',
			'creationModeEqual': 2
		});

		const pager = new KalturaFilterPager({
			'pageIndex': 1,
			'pageSize': 999
		});

		let responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
			type: KalturaResponseProfileType.includeFields,
			fields: 'id,name,html5Url,createdAt,updatedAt,width,height'
		});

		return this._kalturaClient.request(new UiConfListAction({filter, pager}).setRequestOptions({
            responseProfile
        }));
	}

	generateShortLink(url: string): Observable<KalturaShortLink>{

		let shortLink: KalturaShortLink = new KalturaShortLink();
		shortLink.systemName = "KMC-PREVIEW";
		shortLink.fullUrl = url;

		return this._kalturaClient.request(new ShortLinkAddAction({shortLink}));
	}
}


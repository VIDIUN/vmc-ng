import { Injectable } from '@angular/core';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { VidiunClient } from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { UiConfListAction } from 'vidiun-ngx-client';
import { VidiunUiConfFilter } from 'vidiun-ngx-client';
import { VidiunUiConfListResponse } from 'vidiun-ngx-client';
import { VidiunDetachedResponseProfile } from 'vidiun-ngx-client';
import { VidiunResponseProfileType } from 'vidiun-ngx-client';
import { ShortLinkAddAction } from 'vidiun-ngx-client';
import { VidiunShortLink } from 'vidiun-ngx-client';

export type EmbedConfig = {
    embedType: string;
    entryId: string;
    vs: string;
    uiConfId: string;
    width: number;
    height: number;
    pid: number;
    serverUri: string;
    playerConfig: string;
}

@Injectable()
export class PreviewEmbedService {

	constructor(private _vidiunClient: VidiunClient) {
	}

	listPlayers(isPlaylist: boolean = false): Observable<VidiunUiConfListResponse>{

		const tags = isPlaylist ? 'playlist' : 'player';

		const filter = new VidiunUiConfFilter({
			'tagsMultiLikeAnd': tags,
			'orderBy': '-updatedAt',
			'objTypeIn': '1,8',
			'creationModeEqual': 2
		});

		const pager = new VidiunFilterPager({
			'pageIndex': 1,
			'pageSize': 999
		});

		let responseProfile: VidiunDetachedResponseProfile = new VidiunDetachedResponseProfile({
			type: VidiunResponseProfileType.includeFields,
			fields: 'id,name,html5Url,createdAt,updatedAt,width,height,tags'
		});

		return this._vidiunClient.request(new UiConfListAction({filter, pager}).setRequestOptions({
            responseProfile
        }));
	}

	generateShortLink(url: string): Observable<VidiunShortLink>{

		let shortLink: VidiunShortLink = new VidiunShortLink();
		shortLink.systemName = "VMC-PREVIEW";
		shortLink.fullUrl = url;

		return this._vidiunClient.request(new ShortLinkAddAction({shortLink}));
	}

	generateV3EmbedCode(config: any): string {
	    let code = '';
        const rnd = Math.floor(Math.random() * 1000000000);

        switch (config.embedType) {
            case 'dynamic':
            case 'thumb':
                code = `<div id="vidiun_player_${rnd}" style="width: ${config.width}px;height: ${config.height}px"></div>
<script type="text/javascript" src="${config.serverUri}/p/${config.pid}/embedPakhshkitJs/uiconf_id/${config.uiConfId}"></script>
  <script type="text/javascript">
    try {
      var vidiunPlayer = VidiunPlayer.setup({
        targetId: "vidiun_player_${rnd}",
        provider: {
          ${config.playerConfig}
          partnerId: ${config.pid},
          uiConfId: ${config.uiConfId}
        }
      });
      vidiunPlayer.loadMedia({entryId: '${config.entryId}'});
    } catch (e) {
      console.error(e.message)
    }
  </script>`;
                break;
            case 'iframe':
                code = `<iframe type="text/javascript" src='${config.serverUri}/p/${config.pid}/embedPakhshkitJs/uiconf_id/${config.uiConfId}?iframeembed=true&entry_id=${config.entryId}${config.playerConfig}' style="width: ${config.width}px;height: ${config.height}px" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0"></iframe>`;
                break;
            case 'auto':
                code = `<div id="vidiun_player_${rnd}" style="width: ${config.width}px;height: ${config.height}px"></div>
<script type="text/javascript" src='${config.serverUri}/p/${config.pid}/embedPakhshkitJs/uiconf_id/${config.uiConfId}?autoembed=true&targetId=vidiun_player_${rnd}&entry_id=${config.entryId}${config.playerConfig}'></script>`
                break;
            default:
                break;
        }
        return code;
    }

}


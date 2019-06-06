import { Component, AfterContentInit, Input } from '@angular/core';
import { AppAuthentication } from 'app-shared/vmc-shell';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { serverConfig, getVidiunServerUri } from 'config/server';

@Component({
    selector: 'vThumbnailCapture',
    templateUrl: './entry-thumbnails-capture.component.html',
    styleUrls: ['./entry-thumbnails-capture.component.scss']
})
export class EntryThumbnailCapture implements AfterContentInit{

	@Input() entryId: string;
	@Input() parentPopupWidget: PopupWidgetComponent;

    serverUri = getVidiunServerUri();
    playerConfig: any;
    vdp: any;

    constructor(private _appAuthentication: AppAuthentication) {
    }

	ngAfterContentInit(){
		this.playerConfig = {
			uiconfid: serverConfig.vidiunServer.previewUIConf,
			pid: this._appAuthentication.appUser.partnerId,
			entryid: this.entryId,
            flashvars: {
			    vs: this._appAuthentication.appUser.vs
            }
		};

	}

	onPlayerReady(vdp){
		this.vdp = vdp;
	}

	_capture(){
		// pass current position
		const context = {
			currentPosition: this.vdp.evaluate('{video.player.currentTime}')
		};
		this.parentPopupWidget.close(context);
	}

}


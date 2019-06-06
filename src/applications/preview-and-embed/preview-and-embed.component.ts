import { Component, OnDestroy, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { PreviewAndEmbedEvent } from 'app-shared/vmc-shared/events';
import { AppEventsService } from 'app-shared/vmc-shared';
import { VidiunPlaylist } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
  selector: 'vPreviewEmbed',
  templateUrl: './preview-and-embed.component.html',
  styleUrls: ['./preview-and-embed.component.scss'],
})
export class PreviewEmbedComponent implements OnDestroy {

  @ViewChild('previewEmbed') previewEmbedPopup: PopupWidgetComponent;

  public _media: VidiunPlaylist | VidiunMediaEntry;

  constructor(appEvents: AppEventsService) {
    appEvents.event(PreviewAndEmbedEvent)
	    .pipe(cancelOnDestroy(this))
	    .subscribe(({media}) =>
        {
          this._media = media;
          if ((media instanceof VidiunPlaylist || media instanceof VidiunMediaEntry) && !this.previewEmbedPopup.isShow) {
            this.previewEmbedPopup.open();
          }else{
            console.warn("Cannot open preview & embed (window already open?)");
          }
        });
  }

  public close(): void{
    this.previewEmbedPopup.close();
  }

  ngOnDestroy(){

  }
}


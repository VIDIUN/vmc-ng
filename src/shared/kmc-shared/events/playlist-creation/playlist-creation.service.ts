import { Injectable, OnDestroy } from '@angular/core';
import { AppEventsService } from 'shared/kmc-shared/app-events';
import { CreateNewPlaylistEvent, CreateNewPlaylistEventArgs } from './create-new-playlist.event';
import { ISubscription } from 'rxjs/Subscription';
import { ContentPlaylistViewSections, ContentPlaylistViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import { KalturaPlaylistType } from 'kaltura-ngx-client/api/types/KalturaPlaylistType';

@Injectable()
export class PlaylistCreationService implements OnDestroy {
  private _creationSubscription: ISubscription;
  private _newPlaylistData: CreateNewPlaylistEventArgs;

  constructor(private _appEvents: AppEventsService,
              private _contentPlaylistViewService: ContentPlaylistViewService,
              private _browserService: BrowserService) {
  }

  ngOnDestroy() {
    if (this._creationSubscription) {
      this._creationSubscription.unsubscribe();
      this._creationSubscription = null;
    }
  }

  public init(): void {
    if (!this._creationSubscription) {
      this._creationSubscription = this._appEvents.event(CreateNewPlaylistEvent)
        .subscribe(({ data, section }) => {
          this._newPlaylistData = data;
            const playlist = new KalturaPlaylist({ playlistType: data.type });
            (<any>playlist).id = 'new';
            if (!section) {
              section = playlist.playlistType === KalturaPlaylistType.staticList
                  ? ContentPlaylistViewSections.Content
                  : ContentPlaylistViewSections.ContentRuleBased;
            }
            if (this._contentPlaylistViewService.isAvailable({ playlist, section })) {
                this._contentPlaylistViewService.open({ playlist, section });
            } else {
                this._browserService.handleUnpermittedAction(false);
            }
        });
    } else {
      console.warn('Service was already initialized!');
    }
  }

  public popNewPlaylistData(): CreateNewPlaylistEventArgs {
    const newPlaylistData = this._newPlaylistData;
    this._newPlaylistData = null;
    return newPlaylistData;
  }
}

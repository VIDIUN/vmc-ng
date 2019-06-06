import { Component, OnDestroy, OnInit } from '@angular/core';
import { VidiunPlaylist } from 'vidiun-ngx-client';
import { PlaylistDetailsWidget } from './playlist-details-widget.service';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
  selector: 'vPlaylistDetails',
  templateUrl: './playlist-details.component.html',
  styleUrls: ['./playlist-details.component.scss']
})
export class PlaylistDetailsComponent implements OnInit, OnDestroy {
  public _currentPlaylist: VidiunPlaylist;
  public _isNew = false;

  constructor(public _widgetService: PlaylistDetailsWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
    this._widgetService.data$
      .pipe(cancelOnDestroy(this))
      .filter(Boolean)
      .subscribe(data => {
        this._currentPlaylist = data;
        this._isNew = !this._currentPlaylist.id;
      });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}


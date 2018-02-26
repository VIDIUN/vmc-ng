import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {Menu, MenuItem} from 'primeng/primeng';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaBaseSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaBaseSyndicationFeed';
import {KalturaPlaylist} from 'kaltura-ngx-client/api/types/KalturaPlaylist';

@Component({
  selector: 'kFeedsTable',
  templateUrl: './feeds-table.component.html',
  styleUrls: ['./feeds-table.component.scss']
})
export class FeedsTableComponent implements AfterViewInit, OnInit, OnDestroy {

  public _feeds: KalturaBaseSyndicationFeed[] = [];
  private _deferredFeeds: any[];
  public _deferredLoading = true;
  public _idToPlaylistMap: Map<string, KalturaPlaylist> = null; // map between KalturaPlaylist id to KalturaPlaylist.name object
  public _copyToClipboardTooltips: { success: string, failure: string, idle: string, notSupported: string } = null;

  @Input()
  set feeds(data: any[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of feeds
      // (ie when returning from feed page) - we should force detect changes on an empty list
      this._feeds = [];
      this._cdRef.detectChanges();
      this._feeds = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredFeeds = data
    }
  }

  @Input()
  set playlists(data: KalturaPlaylist[]) {
    if (data && data.length) {
      this._idToPlaylistMap = new Map<string, KalturaPlaylist>();
      data.forEach(playlist => {
        this._idToPlaylistMap.set(playlist.id, playlist);
      });
    }
  }

  @Input() sortField: string = null;
  @Input() sortOrder: number = null;
  @Input() selectedFeeds: KalturaBaseSyndicationFeed[] = [];

  @Output()
  sortChanged = new EventEmitter<{ field: string, order: number}>();
  @Output()
  actionSelected = new EventEmitter<{ action: string, feed: KalturaBaseSyndicationFeed }>();
  @Output()
  selectedFeedsChange = new EventEmitter<any>();

  @ViewChild('actionsmenu') private _actionsMenu: Menu;
  private _actionsMenuFeed: KalturaBaseSyndicationFeed;

  public _emptyMessage = '';

  public _items: MenuItem[];

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef) {
    this._fillCopyToClipboardTooltips();
  }

  ngOnInit() {
    this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._feeds = this._deferredFeeds;
        this._deferredFeeds = null;
      }, 0);
    }
  }

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  public _openActionsMenu(event: any, feed: KalturaBaseSyndicationFeed) {
    if (this._actionsMenu) {
      this._actionsMenu.toggle(event);
      if (!this._actionsMenuFeed || this._actionsMenuFeed.id !== feed.id) {
        if (!this._items) {
          this._buildMenu();
        }
        this._actionsMenuFeed = feed;
        this._actionsMenu.show(event);
      }
    }
  }

  public _editFeed(feed: KalturaBaseSyndicationFeed) {
    this._onActionSelected('edit', feed);
  }

  public _onSelectionChange(event) {
    this.selectedFeedsChange.emit(event);
  }

  public _onSortChanged(event) {
    if (event.field && event.order) {
      // primeng workaround: must check that field and order was provided to prevent reset of sort value
      this.sortChanged.emit({field: event.field, order: event.order});
    }
  }

  private _onActionSelected(action: string, feed: KalturaBaseSyndicationFeed) {
    this.actionSelected.emit({'action': action, 'feed': feed});
  }

  private _buildMenu(): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.content.syndication.table.actions.edit'),
        command: (event) => {
          this._onActionSelected('edit', this._actionsMenuFeed);
        }
      },
      {
        label: this._appLocalization.get('applications.content.syndication.table.actions.delete'),
        command: (event) => {
          this._onActionSelected('delete', this._actionsMenuFeed);
        }
      },
    ];
  }

  private _fillCopyToClipboardTooltips(): void {
    this._copyToClipboardTooltips = {
      success: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.success'),
      failure: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.failure'),
      idle: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.idle'),
      notSupported: this._appLocalization.get('applications.content.syndication.table.copyToClipboardTooltip.notSupported')
    };
  }

}


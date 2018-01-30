import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {KalturaPlaylist} from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {KalturaBaseSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaBaseSyndicationFeed';
import {KalturaUiConf} from 'kaltura-ngx-client/api/types/KalturaUiConf';
import {KalturaFlavorParams} from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import {FeedsService} from 'applications/content-syndication-app/feeds/feeds.service';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaSyndicationFeedType} from 'kaltura-ngx-client/api/types/KalturaSyndicationFeedType';
import {FlavoursStore} from 'app-shared/kmc-shared';
import {Observable} from 'rxjs/Observable';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaSyndicationFeedEntryCount} from 'kaltura-ngx-client/api/types/KalturaSyndicationFeedEntryCount';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PlayersStore} from 'app-shared/kmc-shared/players/players-store.service';
import {KalturaPlaylistType} from 'kaltura-ngx-client/api/types/KalturaPlaylistType';


export abstract class DestinationComponentBase {
  abstract getData(): KalturaBaseSyndicationFeed;
}


@Component({
  selector: 'kFeedDetails',
  templateUrl: './feed-details.component.html',
  styleUrls: ['./feed-details.component.scss']
})
export class FeedDetailsComponent implements OnInit, OnDestroy {

  @Input() parentPopupWidget: PopupWidgetComponent;

  @Input()
  playlists: KalturaPlaylist[] = [];

  @Input()
  feed: KalturaBaseSyndicationFeed = null;

  @ViewChild(DestinationComponentBase) destinationComponent: DestinationComponentBase;

  public _form: FormGroup;
  public _players: KalturaUiConf[] = null;
  public _flavors: KalturaFlavorParams[] = null;
  public _entriesCountData: { count: number, showWarning: boolean, warningCount: number, flavorName: string } =
    {count: 0, showWarning: false, warningCount: 0, flavorName: null};
  public _availableDestinations: Array<{ value: KalturaSyndicationFeedType, label: string }>;
  public _availablePlaylists: Array<{ value: KalturaPlaylist, label: string }>;
  public _kalturaSyndicationFeedType = KalturaSyndicationFeedType;
  public _kalturaPlaylistType = KalturaPlaylistType;
  public _currentDestinationFormState: { isValid: boolean, isDirty: boolean } = {isValid: true, isDirty: false};
  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isReady = false; // determined when received entryCount, feed, flavors and players
  public _mode: 'edit' | 'new' = 'new';
  public _newFeedText = 'New Feed';

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _feedsService: FeedsService,
              private _flavorsStore: FlavoursStore,
              private _playersStore: PlayersStore) {
    // prepare form
    this._createForm();
  }

  ngOnInit() {
    this._newFeedText = this._appLocalization.get('applications.content.syndication.details.header.newFeed');
    this._fillAvailableDestinations();
    this._fillAvailablePlaylists();
    this._mode = this.feed ? 'edit' : 'new';
    this._restartFormData();
    this._prepare();
  }

  ngOnDestroy() {
  }

  private _fillAvailablePlaylists(): void {
    this._availablePlaylists = this.playlists.map(playlist => ({value: playlist, label: playlist.name || playlist.id}));
  }

  private _fillAvailableDestinations(): void {
    this._availableDestinations = [
      {
        value: KalturaSyndicationFeedType.googleVideo,
        label: this._appLocalization
          .get('applications.content.syndication.details.availableDestinations.google')
      },
      {
        value: KalturaSyndicationFeedType.yahoo,
        label: this._appLocalization
          .get('applications.content.syndication.details.availableDestinations.yahoo')
      },
      // {
      //   value: KalturaSyndicationFeedType.itunes,
      //   label: this._appLocalization
      //     .get('applications.content.syndication.details.availableDestinations.itunes')
      // },
      {
        value: KalturaSyndicationFeedType.rokuDirectPublisher,
        label: this._appLocalization
          .get('applications.content.syndication.details.availableDestinations.roku')
      },
      {
        value: KalturaSyndicationFeedType.operaTvSnap,
        label: this._appLocalization
          .get('applications.content.syndication.details.availableDestinations.opera')
      },
      {
        value: KalturaSyndicationFeedType.kalturaXslt,
        label: this._appLocalization
          .get('applications.content.syndication.details.availableDestinations.flexibaleFormat')
      }
    ];
  }

  private _prepare(): void {
    this._isBusy = true;
    this._queryData()
      .cancelOnDestroy(this)
      .subscribe(response => {
        this._isBusy = false;
        if (!this._isReady) {
          this._players = response.players;
          this._flavors = response.flavors;
          if (response.entriesCount) {
            const showEntriesCountWarning: boolean =
              [KalturaSyndicationFeedType.googleVideo, KalturaSyndicationFeedType.itunes, KalturaSyndicationFeedType.yahoo].indexOf(this.feed.type) >= 0;

            this._entriesCountData = {
              count: response.entriesCount.actualEntryCount,
              showWarning: showEntriesCountWarning && response.entriesCount.totalEntryCount > response.entriesCount.actualEntryCount,
              warningCount: showEntriesCountWarning ? response.entriesCount.requireTranscodingCount : null,
              flavorName: (() => {
                if (!showEntriesCountWarning) {
                  return null;
                }
                const flavor = this._flavors.find(flvr => flvr.id === this.feed.flavorParamId);
                // return flavor ID if couldn't get flavor name
                return ((flavor && flavor.name) ||
                  (this.feed.flavorParamId &&
                    this._appLocalization.get('applications.content.syndication.details.entriesCountData.flavorId',
                      {0: this.feed.flavorParamId.toString()})));
              })()
            };
          }
          this._isReady = true;
        }
      }, error => {
        this._isBusy = false;
        this._blockerMessage = new AreaBlockerMessage({
          message: this._appLocalization.get('applications.content.syndication.details.errors.loadFailed'),
          buttons: [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._blockerMessage = null;
                this._prepare();
              }
            }, {
              label: this._appLocalization.get('app.common.close'),
              action: () => {
                this._blockerMessage = null;
                this._close();
              }
            }
          ]
        });
      });
  }

  private _queryData(): Observable<{ players: KalturaUiConf[], flavors: KalturaFlavorParams[], entriesCount?: KalturaSyndicationFeedEntryCount }> {
    if (this._mode === 'edit' && (!this.feed || !this.feed.id)) {
      return Observable.throw('Unable to load additional feed data');
    }

    const getPlayers$ = this._playersStore.get().cancelOnDestroy(this);
    const getFlavours$ = this._flavorsStore.get().cancelOnDestroy(this);
    const requests: Observable<any>[] = [getPlayers$, getFlavours$];

    if (this._mode === 'edit') {
      const getEntriesCount$ = this._feedsService.getFeedEntryCount(this.feed.id).cancelOnDestroy(this);
      requests.push(getEntriesCount$);
    }
    return Observable.forkJoin(...requests)
      .cancelOnDestroy(this)
      .map(response => {
        const players = response[0].items.map(player => ({
          id: player.id,
          name: player.name || this._appLocalization.get('applications.content.syndication.details.playerName', {0: player.id})
        }));

        return {players, flavors: response[1].items, entriesCount: this._mode === 'edit' ? response[2] : null};
      });
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._form = this._fb.group({
      name: ['', Validators.required],
      contentType: ['allContent'],
      selectedPlaylist: [null],
      destination: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  private _restartFormData(): void {
    this._form.reset({
      name: this._mode === 'edit' ? this.feed.name : this._form.get('name').value || '',
      contentType: this._mode === 'edit' ? (this.feed.playlistId ? 'playlist' : 'allContent') : this._form.get('contentType').value || 'allContent',
      selectedPlaylist: this._mode === 'edit' ?
        (this.feed.playlistId && this.playlists.find(playlist => playlist.id === this.feed.playlistId)) :
        this._form.get('selectedPlaylist').value || (this.playlists && this.playlists.length && this.playlists[0].id),
      destination: {
        value: this._mode === 'edit' ? this.feed.type : this._form.get('destination').value,
        disabled:  this._mode === 'edit'
      },
    });
  }

  public _clearPlaylist(): void {
    this._form.patchValue({selectedPlaylist: null});
  }

  public _save(): void {
    if (!this._form.valid ||
      !this._currentDestinationFormState.isValid ||
      (!this._form.dirty && !this._currentDestinationFormState.isDirty)) {
      return undefined;
    }

    const syndicationFeed = this.destinationComponent.getData();
    syndicationFeed.name = this._form.get('name').value;
    syndicationFeed.playlistId =
      this._form.get('contentType').value === 'allContent' ?
        '' :
        this._form.get('selectedPlaylist').value.id;


    if (this._mode === 'edit') {
      this._updateFeed(this.feed.id, syndicationFeed);
    } else {
      this._addNewFeed(syndicationFeed);
    }
  }

  private _addNewFeed(syndicationFeed: KalturaBaseSyndicationFeed): void {
    this._blockerMessage = null;

    this._feedsService.create(syndicationFeed)
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe((feed) => {
        this._feedsService.reload();
        this._close();
      }, error => {
        this._blockerMessage = new AreaBlockerMessage({
          message: error.message,
          buttons: [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._blockerMessage = null;
                this._addNewFeed(syndicationFeed);
              }
            }, {
              label: this._appLocalization.get('app.common.close'),
              action: () => {
                this._blockerMessage = null;
                this._close();
              }
            }
          ]
        });
      });
  }

  private _updateFeed(id: string, syndicationFeed: KalturaBaseSyndicationFeed): void {
    this._blockerMessage = null;

    this._feedsService.update(id, syndicationFeed)
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(() => {
        this._feedsService.reload();
        this._close();
      }, error => {
        this._blockerMessage = new AreaBlockerMessage({
          message: error.message,
          buttons: [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._blockerMessage = null;
                this._updateFeed(id, syndicationFeed);
              }
            }, {
              label: this._appLocalization.get('app.common.close'),
              action: () => {
                this._blockerMessage = null;
                this._close();
              }
            }
          ]
        });
      });
  }

  public _close(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }

  public _updateCurrentDestinationFormState($event: { isValid: boolean, isDirty: boolean }) {
    this._currentDestinationFormState = $event;
  }

  public _deleteFeed() {
    const executeDelete = () => {
      this._blockerMessage = null;
      this._feedsService.deleteFeeds([this.feed.id])
        .cancelOnDestroy(this)
        .tag('block-shell')
        .subscribe(
          result => {
            this._feedsService.reload();
            this._close();
          }, // reload is handled by service
          error => {
            this._blockerMessage = new AreaBlockerMessage({
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._blockerMessage = null;
                    executeDelete();
                  }
                }, {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            });
          }
        );
    };

    if (this._mode === 'edit') {
      this._feedsService.confirmDelete([this.feed])
        .cancelOnDestroy(this)
        .subscribe(result => {
          if (result.confirmed) {
            executeDelete();
          }
        }, error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.ok'),
                action: () => {
                  this._blockerMessage = null;
                }
              }
            ]
          });
        });
    }
  }
}

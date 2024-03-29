import { Injectable, OnDestroy } from '@angular/core';
import { VidiunClient, VidiunMultiRequest, VidiunObjectBaseFactory } from 'vidiun-ngx-client';
import { VidiunPlaylist } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import { VidiunDetachedResponseProfile } from 'vidiun-ngx-client';
import { VidiunResponseProfileType } from 'vidiun-ngx-client';
import { PlaylistExecuteAction } from 'vidiun-ngx-client';
import { FriendlyHashId } from '@vidiun-ng/vidiun-common';
import { VidiunUtils } from '@vidiun-ng/vidiun-common';
import { VidiunBaseEntry } from 'vidiun-ngx-client';
import { BaseEntryListAction } from 'vidiun-ngx-client';
import { VidiunBaseEntryFilter } from 'vidiun-ngx-client';
import { PlaylistWidget } from '../../playlist-widget';
import { VidiunPlaylistType } from 'vidiun-ngx-client';
import { VidiunFilterPager } from 'vidiun-ngx-client';
import { ContentPlaylistViewSections } from 'app-shared/vmc-shared/vmc-views/details-views';
import {VidiunLogger} from '@vidiun-ng/vidiun-logger';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

export interface PlaylistContentMediaEntry extends VidiunMediaEntry {
  selectionId?: string;
}

@Injectable()
export class ManualContentWidget extends PlaylistWidget implements OnDestroy {
  private _selectionIdGenerator = new FriendlyHashId();

  public entries: PlaylistContentMediaEntry[] = [];
  public entriesTotalCount = 0;
  public entriesDuration = 0;


  constructor(private _vidiunClient: VidiunClient, logger: VidiunLogger) {
    super(ContentPlaylistViewSections.Content, logger);
  }

  ngOnDestroy() {
  }

  protected onValidate(wasActivated: boolean): Observable<{ isValid: boolean }> {
    if (this.data.playlistType === VidiunPlaylistType.staticList) { // validate only manual playlist
      if (this.wasActivated) {
        return Observable.of({ isValid: !!this.entries.length });
      }

      if (this.isNewData && (this.data.playlistContent || '').trim().length > 0) {
        return Observable.of({ isValid: true });
      }

      return Observable.of({ isValid: false });
    }

    return Observable.of({ isValid: true });
  }

  protected onDataSaving(data: VidiunPlaylist, request: VidiunMultiRequest): void {
    if (this.data.playlistType === VidiunPlaylistType.staticList) { // handle only manual playlist
      if (this.wasActivated) {
        data.playlistContent = this.entries.map(({ id }) => id).join(',');
      } else if (this.isNewData && (this.data.playlistContent || '').trim().length > 0) {
        data.playlistContent = this.data.playlistContent
      } else {
        // shouldn't reach this part since 'onValidate' should prevent execution of this function
        // if data is invalid
        throw new Error('invalid scenario');
      }
    }
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
    this.entries = [];
    this.entriesTotalCount = 0;
    this.entriesDuration = 0;
  }

  protected onActivate(): Observable<{ failed: boolean, error?: Error }> {
    super._showLoader();

    return this._getEntriesRequest()
      .pipe(cancelOnDestroy(this, this.widgetReset$))
      .map((entries: VidiunMediaEntry[]) => {
        this.entries = this._extendWithSelectionId(entries);
        this._recalculateCountAndDuration();
        super._hideLoader();
        return { failed: false };
      })
      .catch(error => {
        super._hideLoader();
        super._showActivationError(error.message);
        return Observable.of({ failed: true, error });
      });
  }

  private _getEntriesRequest(): Observable<VidiunBaseEntry[]> {

    const responseProfile = new VidiunDetachedResponseProfile({
      type: VidiunResponseProfileType.includeFields,
      fields: 'thumbnailUrl,id,name,mediaType,createdAt,duration,externalSourceType,capabilities'
    });
    if (this.isNewData) {
      if (this.data.playlistContent) {
        return this._vidiunClient.request(new BaseEntryListAction({
          filter: new VidiunBaseEntryFilter({ idIn: this.data.playlistContent }),

          pager: new VidiunFilterPager({ pageSize: 500 })
        }).setRequestOptions({
            responseProfile
        }))
          .map(response => {
              return response.objects.map(entry => {
                  if ((entry.capabilities || '').indexOf('quiz.quiz') !== -1) {
                      entry['isQuizEntry'] = true;
                  }

                  return entry;
              });
          });
      } else {
        return Observable.of([]);
      }
    } else {
      return this._vidiunClient.request(new PlaylistExecuteAction({
        id: this.data.id
      }).setRequestOptions({
          acceptedTypes: [VidiunMediaEntry],
          responseProfile
      })).map(entries => {
          return entries.map(entry => {
              if ((entry.capabilities || '').indexOf('quiz.quiz') !== -1) {
                  entry['isQuizEntry'] = true;
              }

              return entry;
          });
      });
    }
  }

  private _extendWithSelectionId(entries: VidiunMediaEntry[]): PlaylistContentMediaEntry[] {
    return entries.map(entry => {
      (<PlaylistContentMediaEntry>entry).selectionId = this._selectionIdGenerator.generateUnique(this.entries.map(item => item.selectionId));

      return (<PlaylistContentMediaEntry>entry);
    });
  }

  private _setDirty(): void {
    this.updateState({ isDirty: true });
  }

  private _recalculateCountAndDuration(): void {
    this.entriesTotalCount = this.entries.length;
    this.entriesDuration = this.entries.reduce((acc, val) => acc + val.duration, 0);
  }

  private _deleteEntryFromPlaylist(entry: PlaylistContentMediaEntry): void {
    const entryIndex = this.entries.indexOf(entry);

    if (entryIndex !== -1) {
      this.entries.splice(entryIndex, 1);
      this._recalculateCountAndDuration();

      this._setDirty();
    }
  }

  private _duplicateEntry(entry: PlaylistContentMediaEntry): void {
    const entryIndex = this.entries.indexOf(entry);

    if (entryIndex !== -1) {
      const clonedEntry = <PlaylistContentMediaEntry>Object.assign(VidiunObjectBaseFactory.createObject(entry), entry);
      this._extendWithSelectionId([clonedEntry]);
      this.entries.splice(entryIndex, 0, clonedEntry);
      this._recalculateCountAndDuration();
      this._setDirty();
    }
  }

  private _moveUpEntries(selectedEntries: PlaylistContentMediaEntry[]): void {
    if (VidiunUtils.moveUpItems(this.entries, selectedEntries)) {
      this._setDirty();
    }
  }

  private _moveDownEntries(selectedEntries: PlaylistContentMediaEntry[]): void {
    if (VidiunUtils.moveDownItems(this.entries, selectedEntries)) {
      this._setDirty();
    }
  }

  private _moveTopEntry(selectedEntry: PlaylistContentMediaEntry): void {
      const index = this.entries.indexOf(selectedEntry);
      if (index > 0){
          this.entries.splice(index, 1);
          this.entries.unshift(selectedEntry);
          this._setDirty();
      }
  }

  private _moveBottomEntry(selectedEntry: PlaylistContentMediaEntry): void {
      const index = this.entries.indexOf(selectedEntry);
      if (index > -1){
          this.entries.splice(index, 1);
          this.entries.push(selectedEntry);
          this._setDirty();
      }
  }

  public deleteSelectedEntries(entries: PlaylistContentMediaEntry[]): void {
    entries.forEach(entry => this._deleteEntryFromPlaylist(entry));
  }

  public onActionSelected({ action, entry }: { action: string, entry: PlaylistContentMediaEntry }): void {
    switch (action) {
      case 'remove':
        this._deleteEntryFromPlaylist(entry);
        break;
      case 'moveUp':
        this._moveUpEntries([entry]);
        break;
      case 'moveDown':
        this._moveDownEntries([entry]);
        break;
      case 'duplicate':
        this._duplicateEntry(entry);
        break;
      case 'moveTop':
        this._moveTopEntry(entry)
        break;
      case 'moveBottom':
        this._moveBottomEntry(entry);
        break;
      default:
        break;
    }
  }

  public moveEntries({ entries, direction }: { entries: PlaylistContentMediaEntry[], direction: 'up' | 'down' }): void {
    if (direction === 'up') {
      this._moveUpEntries(entries);
    } else {
      this._moveDownEntries(entries);
    }
  }

  public addEntries(entries: VidiunMediaEntry[]): void {
    this.entries.push(...this._extendWithSelectionId(entries));
    this._recalculateCountAndDuration();
    this._setDirty();
  }

  public onSortChanged(event: { field: string, order: -1 | 1, multisortmeta: any }): void {
    this.entries.sort(this._getComparatorFor(event.field, event.order));
    this._setDirty();
  }

  private _getComparatorFor(field: string, order: -1 | 1): (a: PlaylistContentMediaEntry, b: PlaylistContentMediaEntry) => number {
    return (a, b) => {
      const fieldA = typeof a[field] === 'string' ? a[field].toLowerCase() : a[field];
      const fieldB = typeof b[field] === 'string' ? b[field].toLowerCase() : b[field];

      if (fieldA < fieldB) {
        return order;
      }

      if (fieldA > fieldB) {
        return -order;
      }

      return 0;
    };
  }
}

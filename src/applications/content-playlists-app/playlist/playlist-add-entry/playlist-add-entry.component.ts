import { Component, EventEmitter, Output } from '@angular/core';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunEntryStatus } from 'vidiun-ngx-client';
import { EntriesFilters } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/vmc-shared/columns-resize-manager';

@Component({
  selector: 'vAddEntry',
  templateUrl: './playlist-add-entry.component.html',
  styleUrls: ['./playlist-add-entry.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'manual-playlist-add-entries-table' }
    ]
})
export class PlaylistAddEntryComponent {
  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onAddEntries = new EventEmitter<VidiunMediaEntry[]>();

  public _selectedEntries: VidiunMediaEntry[] = [];
  public _addButtonLabel = '';
  public _addButtonLabelTranslation = '';
  public _enforcedFilters: Partial<EntriesFilters> = {
    'ingestionStatuses': [
      VidiunEntryStatus.preconvert.toString(),
      VidiunEntryStatus.ready.toString(),
      VidiunEntryStatus.moderate.toString(),
      VidiunEntryStatus.blocked.toString()
    ]
  };

  constructor(private _appLocalization: AppLocalization) {
    this._addButtonLabelTranslation = this._addButtonLabel = this._appLocalization.get('applications.content.playlists.addToPlaylist');
  }

  public _selectionChanged(entries: VidiunMediaEntry[]): void {
    this._addButtonLabel = entries.length > 0
      ? `${this._addButtonLabelTranslation} ${entries.length}`
      : this._addButtonLabelTranslation;
  }

  public _addEntries(): void {
    this.onAddEntries.emit(this._selectedEntries);
    this.onClosePopupWidget.emit();
  }
}


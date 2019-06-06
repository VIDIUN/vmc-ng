import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import {
  EntriesFilters, EntriesStore,
  EntriesStorePaginationCacheToken
} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { VidiunExternalMediaSourceType, VidiunMediaEntry } from 'vidiun-ngx-client';
import { VidiunObjectBaseFactory } from 'vidiun-ngx-client';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';

export enum EntriesSelectorSelectionMode {
  multiple = 'multiple',
  multipleUnique = 'multipleUnique',
  single = 'single'
}

@Component({
  selector: 'vEntriesSelector',
  templateUrl: './entries-selector.component.html',
  styleUrls: ['./entries-selector.component.scss'],
  providers: [
    EntriesStore,
    { provide: EntriesStorePaginationCacheToken, useValue: 'entries-selector' }
  ]
})
export class EntriesSelectorComponent {

  public _vmcPermissions = VMCPermissions;
    public _youtubeExternalSourceType = VidiunExternalMediaSourceType.youtube;

  @Input() selectionMode: EntriesSelectorSelectionMode = EntriesSelectorSelectionMode.multiple;
  @Input() selectedEntries: VidiunMediaEntry[] = [];
  @Input() enforcedFilters: Partial<EntriesFilters>;
  @Input() defaultFilters: Partial<EntriesFilters>;
  @Input() columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    createdAt: { sortable: true, width: '140px' },
    plays: { sortable: true, width: '76px' },
    addToBucket: { sortable: false, width: '80px' }
  };

  @Output() selectedEntriesChange = new EventEmitter<VidiunMediaEntry[]>();
  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  constructor(public _entriesStore: EntriesStore) {
  }

  public _onActionSelected({ action, entry }: { action: string, entry: VidiunMediaEntry }): void {
    switch (action) {
      case 'addToBucket':
        this._addToBucket(entry);
        break;
      default:
        break;
    }
  }

  public _removeSelected(entry: VidiunMediaEntry): void {
    this.selectedEntries.splice(this.selectedEntries.indexOf(entry), 1);
    this.selectedEntriesChange.emit(this.selectedEntries);
  }

  public _addToBucket(entry: VidiunMediaEntry): void {
    switch (this.selectionMode) {
      case EntriesSelectorSelectionMode.multiple:
        const clonedEntry = <VidiunMediaEntry>Object.assign(VidiunObjectBaseFactory.createObject(entry), entry);
        this.selectedEntries.push(clonedEntry);
        break;

      case EntriesSelectorSelectionMode.multipleUnique:
        const newSelection = this.selectedEntries.indexOf(entry) === -1;
        if (newSelection) {
          this.selectedEntries.push(entry);
        }
        break;

      case EntriesSelectorSelectionMode.single:
        this.selectedEntries = [entry];
        break;
      default:
        break;
    }

    this.selectedEntriesChange.emit(this.selectedEntries);
  }
}

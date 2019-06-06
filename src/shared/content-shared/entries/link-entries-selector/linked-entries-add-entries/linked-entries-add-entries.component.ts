import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { EntriesStore, EntriesStorePaginationCacheToken } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { EntriesSelectorSelectionMode } from 'app-shared/content-shared/entries/entries-selector/entries-selector.component';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/vmc-shared/columns-resize-manager';

@Component({
  selector: 'v-linked-entries-add-entries-popup',
  templateUrl: './linked-entries-add-entries.component.html',
  styleUrls: ['./linked-entries-add-entries.component.scss'],
  providers: [
    EntriesStore,
    ColumnsResizeManagerService,
    { provide: EntriesStorePaginationCacheToken, useValue: 'linked-entries-selector' },
    { provide: ResizableColumnsTableName, useValue: 'linked-entries-add-entries-table' }
  ]
})
export class LinkedEntriesAddEntriesComponent implements OnInit {
  @Input() parentPopup: PopupWidgetComponent;
  @Input() selectedEntries: VidiunMediaEntry[];
  @Input() allowMultiple: boolean;

  @Output() addEntries = new EventEmitter<VidiunMediaEntry[]>();

  public _selectedEntries: VidiunMediaEntry[];
  public _selectionMode: EntriesSelectorSelectionMode;
  public _title: string;
  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    id: { sortable: true },
    name: { sortable: true },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    plays: { sortable: true, width: '76px' },
    duration: { sortable: true, width: '76px' },
    addToBucket: { sortable: false, width: '80px' }
  };

  constructor(private _appLocalization: AppLocalization) {

  }

  ngOnInit() {
    this._title = this.allowMultiple
      ? this._appLocalization.get('applications.content.entryDetails.metadata.addEntries')
      : this._appLocalization.get('applications.content.entryDetails.metadata.addEntry');

    this._selectionMode = this.allowMultiple
      ? EntriesSelectorSelectionMode.multiple
      : EntriesSelectorSelectionMode.single;

    this._selectedEntries = [...this.selectedEntries];
  }

  public _addEntries(): void {
    this.addEntries.emit(this._selectedEntries);
    this.parentPopup.close();
  }
}

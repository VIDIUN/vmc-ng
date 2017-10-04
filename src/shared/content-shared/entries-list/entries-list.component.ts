import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';

import { EntriesStore, SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { FreetextFilter } from 'app-shared/content-shared/entries-store/filters/freetext-filter';
import { EntriesTableColumns, EntriesTableComponent } from 'app-shared/content-shared/entries-table/entries-table.component';

@Component({
  selector: 'kEntriesList',
  templateUrl: './entries-list.component.html',
  styleUrls: ['./entries-list.component.scss']
})
export class EntriesListComponent implements OnInit, OnDestroy {
  @Input() isBusy = false;
  @Input() blockerMessage: AreaBlockerMessage = null;
  @Input() selectedEntries: any[] = [];
  @Input() columns: EntriesTableColumns | null;
  @Input() rowActions: { label: string, commandName: string }[];

  @ViewChild(EntriesTableComponent) private dataTable: EntriesTableComponent;

  @Output() onActionsSelected = new EventEmitter<{ action: string, entryId: string }>();

  private querySubscription: ISubscription;

  public _filter = {
    pageIndex: 0,
    freetextSearch: '',
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(private _entriesStore: EntriesStore) {
  }

  removeTag(tag: any) {
    this.clearSelection();
    this._entriesStore.removeFilters(tag);
  }

  removeAllTags() {
    this.clearSelection();
    this._entriesStore.clearAllFilters();
  }

  onFreetextChanged(): void {

    this._entriesStore.removeFiltersByType(FreetextFilter);

    if (this._filter.freetextSearch) {
      this._entriesStore.addFilters(new FreetextFilter(this._filter.freetextSearch));
    }
  }

  onSortChanged(event) {
    this.clearSelection();
    this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
    this._filter.sortBy = event.field;

    this._entriesStore.reload({
      sortBy: this._filter.sortBy,
      sortDirection: this._filter.sortDirection
    });
  }

  onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageIndex = state.page;
      this._filter.pageSize = state.rows;

      this.clearSelection();
      this._entriesStore.reload({
        pageIndex: this._filter.pageIndex + 1,
        pageSize: this._filter.pageSize
      });
    }
  }

  ngOnInit() {
    const queryData = this._entriesStore.queryData;

    if (queryData) {
      this.syncFreetextComponents();
      this._filter.pageSize = queryData.pageSize;
      this._filter.pageIndex = queryData.pageIndex - 1;
      this._filter.sortBy = queryData.sortBy;
      this._filter.sortDirection = queryData.sortDirection;
    }

    this.querySubscription = this._entriesStore.query$.subscribe(
      query => {
        this.syncFreetextComponents();

        this._filter.pageSize = query.data.pageSize;
        this._filter.pageIndex = query.data.pageIndex - 1;
        this.dataTable.scrollToTop();
      }
    );

    this._entriesStore.reload(false);
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
    this.querySubscription = null;
  }

  public _reload() {
    this.clearSelection();
    this._entriesStore.reload(true);
  }

  private syncFreetextComponents() {
    const freetextFilter = this._entriesStore.getFirstFilterByType(FreetextFilter);

    if (freetextFilter) {
      this._filter.freetextSearch = freetextFilter.value;
    } else {
      this._filter.freetextSearch = null;
    }
  }

  clearSelection() {
    this.selectedEntries = [];
  }

  onSelectedEntriesChange(event): void {
    this.selectedEntries = event;
  }

  onBulkChange(event): void {
    if (event.reload === true) {
      this._reload();
    }
  }

}


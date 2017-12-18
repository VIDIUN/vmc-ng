import { Component, Input, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PrimeTreeDataProvider } from '@kaltura-ng/kaltura-primeng-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { environment } from 'app-environment';

import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import { BulkLogRefineFiltersProviderService } from './bulk-log-refine-filters-provider.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { BulkLogFilters, BulkLogStoreService } from '../bulk-log-store/bulk-log-store.service';
import { ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui/components/scroll-to-top-container.component';
import { PrimeTreeActions } from '@kaltura-ng/kaltura-primeng-ui/prime-tree/prime-tree-actions.directive';
import { RefineGroup } from 'app-shared/content-shared/entries-refine-filters/entries-refine-filters.service';
import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui/prime-tree/prime-tree-node';

export interface ListData {
  group?: string;
  items: PrimeTreeNode[];
  selections: PrimeTreeNode[];
}

export interface FiltersGroup {
  label: string;
  lists: ListData[];
}

const listOfFilterNames: (keyof BulkLogFilters)[] = [
  'uploadedAt',
  'bulkUploadObjectTypeIn',
  'statusIn'
];

@Component({
  selector: 'k-bulk-log-refine-filters',
  templateUrl: './bulk-log-refine-filters.component.html',
  styleUrls: ['./bulk-log-refine-filters.component.scss'],
  providers: [BulkLogRefineFiltersProviderService]
})
export class BulkLogRefineFiltersComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;
  @ViewChildren(PrimeTreeActions) public _primeTreesActions: PrimeTreeActions[];

  private _listDataMapping: { [key: string]: ListData } = {};

  // properties that are exposed to the template
  public _groups: FiltersGroup[] = [];

  public _showLoader = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _uploadedAfter: Date;
  public _uploadedBefore: Date;
  public _uploadedAtFilterError: string = null;
  public _uploadedAtDateRange: string = environment.modules.contentEntries.createdAtDateRange;

  constructor(private _bulkLogRefineFilters: BulkLogRefineFiltersProviderService,
              private _primeTreeDataProvider: PrimeTreeDataProvider,
              private _bulkLogStore: BulkLogStoreService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._prepare();
  }

  // keep for cancelOnDestroy operator
  ngOnDestroy() {
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._bulkLogStore.cloneFilters(
      listOfFilterNames
    ));
    this._fixPrimeTreePropagation();
  }

  private _updateComponentState(updates: Partial<BulkLogFilters>): void {
    if (typeof updates.uploadedAt !== 'undefined') {
      this._uploadedAfter = updates.uploadedAt.fromDate || null;
      this._uploadedBefore = updates.uploadedAt.toDate || null;
    }

    let updatedList = false;
    Object.keys(this._listDataMapping).forEach(listName => {
      const listData = this._listDataMapping[listName];
      const listFilter: { value: string, label: string }[] = updates[listName];

      if (listFilter !== null && typeof listFilter !== 'undefined') {
        const listSelectionsMap = this._bulkLogStore.filtersUtils.toMap(listData.selections, 'data');
        const listFilterMap = this._bulkLogStore.filtersUtils.toMap(listFilter, 'value');
        const diff = this._bulkLogStore.filtersUtils.getDiff(listSelectionsMap, listFilterMap);

        diff.added.forEach(addedItem => {
          const listItems = listData.items.length > 0 ? listData.items[0].children : [];
          const matchingItem = listItems.find(item => item.data === (<any>addedItem).value);
          if (!matchingItem) {
            console.warn(`[bulk-log-refine-filters]: failed to sync filter for '${listName}'`);
          } else {
            updatedList = true;
            listData.selections.push(matchingItem);
          }
        });

        diff.deleted.forEach(removedItem => {

          if (removedItem.data !== null && typeof removedItem.data !== 'undefined') {
            // ignore root items (they are managed by the component tree)
            listData.selections.splice(
              listData.selections.indexOf(removedItem),
              1
            );
            updatedList = true;
          }
        });
      }
    });
  }


  private _registerToFilterStoreDataChanges(): void {
    this._bulkLogStore.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(
        ({ changes }) => {
          this._updateComponentState(changes);
        }
      );
  }

  private _prepare(): void {
    this._showLoader = true;
    this._bulkLogRefineFilters.getFilters()
      .cancelOnDestroy(this)
      .first() // only handle it once, no need to handle changes over time
      .subscribe(
        groups => {
          this._showLoader = false;
          this._buildComponentFilters(groups);
          this._restoreFiltersState();
          this._registerToFilterStoreDataChanges();
        },
        error => {
          this._showLoader = false;
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message || 'Error loading filters',
            buttons: [{
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._blockerMessage = null;
                this._prepare();
              }
            }]
          });
        });
  }

  private _fixPrimeTreePropagation() {
    setTimeout(() => {
      if (this._primeTreesActions) {
        this._primeTreesActions.forEach(item => {
          item.fixPropagation();
        })
      }
    });
  }

  private _buildComponentFilters(groups: RefineGroup[]): void {
    this._listDataMapping = {};
    this._groups = [];

    // create root nodes
    groups.forEach(group => {
      const filtersGroup = { label: group.label, lists: [] };
      this._groups.push(filtersGroup);

      group.lists.forEach(list => {

        if (list.items.length > 0) {
          const treeData = { items: [], selections: [], group: list.group };

          this._listDataMapping[list.name] = treeData;
          filtersGroup.lists.push(treeData);

          const listRootNode = new PrimeTreeNode(null, list.label, [], null, { filterName: list.name });

          this._primeTreeDataProvider.create(
            {
              items: list.items,
              idProperty: 'value',
              rootParent: listRootNode,
              nameProperty: 'label',
              payload: { filterName: list.name },
              preventSort: true
            }
          );

          treeData.items.push(listRootNode);
        }
      });

    });
  }


  /**
   * Clear content of created components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearCreatedComponents(): void {
    this._uploadedAtFilterError = '';
    this._bulkLogStore.filter({
      uploadedAt: {
        fromDate: null,
        toDate: null
      }
    });
  }

  /**
   * Clear all content components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearAllComponents(): void {

    // fix primeng issue: manually remove all selections, this is needed since the root selections will not be removed by prime library
    Object.keys(this._listDataMapping)
      .forEach(listId => {
        this._listDataMapping[listId].selections = [];
      });

    this._bulkLogStore.resetFilters(listOfFilterNames);
  }

  public _onCreatedChanged(): void {
    const updateResult = this._bulkLogStore.filter({
      uploadedAt: {
        fromDate: this._uploadedAfter,
        toDate: this._uploadedBefore
      }
    });

    if (updateResult.uploadedAt && updateResult.uploadedAt.failed) {
      this._uploadedAtFilterError = this._appLocalization.get('applications.content.entryDetails.errors.schedulingError');

      setTimeout(() => {
        const createdAt = this._bulkLogStore.cloneFilter('uploadedAt', null);
        this._uploadedAfter = createdAt ? createdAt.fromDate : null;
        this._uploadedBefore = createdAt ? createdAt.toDate : null;

      }, 0);
    } else {
      this._uploadedAtFilterError = null;
    }
  }

  public _onTreeNodeSelect({ node }: { node: PrimeTreeNode }) {
    // find group data by filter name
    const listName = node instanceof PrimeTreeNode && node.payload ? node.payload.filterName : null;
    if (listName) {
      const listData = this._listDataMapping[listName];
      if (listData) {

        let newFilterItems: { value: string, label: string }[];
        let newFilterValue;
        const newFilterName = listName;

        newFilterValue = newFilterItems = this._bulkLogStore.cloneFilter(listName, []);

        const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

        selectedNodes
          .filter(selectedNode => {
            // ignore root items (they are managed by the component tree)
            return selectedNode.data !== null && typeof selectedNode.data !== 'undefined';
          })
          .forEach(selectedNode => {
            if (!newFilterItems.find(item => item.value === selectedNode.data)) {
              newFilterItems.push({ value: selectedNode.data + '', label: selectedNode.label });
            }
          });
        this._bulkLogStore.filter({ [newFilterName]: newFilterValue });
      }
    }
  }

  public _onTreeNodeUnselect({ node }: { node: PrimeTreeNode }) {
    // find group data by filter name
    const listName = node instanceof PrimeTreeNode && node.payload ? node.payload.filterName : null;
    if (listName) {

      const listData = this._listDataMapping[listName];
      if (listData) {

        let newFilterItems: { value: string, label: string }[];
        let newFilterValue;
        const newFilterName = listName;

        newFilterValue = newFilterItems = this._bulkLogStore.cloneFilter(listName, []);

        const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

        selectedNodes
          .filter(selectedNode => {
            // ignore root items (they are managed by the component tree)
            return selectedNode.data !== null && typeof selectedNode.data !== 'undefined';
          })
          .forEach(selectedNode => {
            const itemIndex = newFilterItems.findIndex(item => item.value === selectedNode.data);
            if (itemIndex > -1) {
              newFilterItems.splice(itemIndex, 1);
            }
          });

        this._bulkLogStore.filter({ [newFilterName]: newFilterValue });
      }
    }
  }

  /**
   * Stop propagating clicks of the provided event.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _blockScheduleToggle(event) {
    event.stopPropagation();
  }

  /**
   * Invoke a request to the popup widget container to close the popup widget.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _close() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}

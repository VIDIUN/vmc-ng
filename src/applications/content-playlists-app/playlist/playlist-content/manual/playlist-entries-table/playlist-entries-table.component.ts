import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { Menu, MenuItem } from 'primeng/primeng';
import { VidiunExternalMediaSourceType, VidiunMediaEntry } from 'vidiun-ngx-client';
import { ManualContentWidget } from '../manual-content-widget.service';
import { globalConfig } from 'config/global';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/vmc-shared/vmc-views/details-views';

@Component({
  selector: 'vPlaylistEntriesTable',
  templateUrl: './playlist-entries-table.component.html',
  styleUrls: ['./playlist-entries-table.component.scss']
})
export class PlaylistEntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('actionsmenu') private actionsMenu: Menu;

  @Input() selectedEntries: VidiunMediaEntry[] = [];
  @Input() sortBy: string;
  @Input() sortDirection: number;
  @Input() isNewPlaylist: boolean;

  @Input()
  set entries(data: any[]) {
    if (!this._deferredLoading) {
      this._entries = [];
      this._cdRef.detectChanges();
      this._entries = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredEntries = data;
    }
  }

  @Output() sortChanged = new EventEmitter<any>();
  @Output() selectedEntriesChange = new EventEmitter<any>();
  @Output() onActionSelected = new EventEmitter<{ action: string, entry: VidiunMediaEntry }>();

  public _vmcPermissions = VMCPermissions;
  private _deferredEntries: VidiunMediaEntry[];
  public _entries: VidiunMediaEntry[] = [];
  public _emptyMessage: string;
  public _deferredLoading = true;
  public _items: MenuItem[];
  public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
    public _youtubeExternalSourceType = VidiunExternalMediaSourceType.youtube;
    public _sortBy: string;
    public _sortDirection: number;

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef,
              private _widgetService: ManualContentWidget,
              private _permissionsService: VMCPermissionsService,
              private _contentEntryViewService: ContentEntryViewService) {
  }

  ngOnInit() {
      this.assignEmptyMessage();

  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this._deferredLoading = false;
        this._entries = this._deferredEntries;
        this._deferredEntries = null;
      }, 0);
    }
  }

  ngOnDestroy() {
  }

  private _buildMenu(rowIndex: number, entry: VidiunMediaEntry): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.content.bulkActions.removeFromPlaylist'),
        command: () => this.onActionSelected.emit({ action: 'remove', entry })
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.moveUp'),
        command: () => this.onActionSelected.emit({ action: 'moveUp', entry }),
        disabled: rowIndex === 0
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.moveDown'),
        command: () => this.onActionSelected.emit({ action: 'moveDown', entry }),
        disabled: rowIndex + 1 === this._entries.length
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.duplicate'),
        command: () => this.onActionSelected.emit({ action: 'duplicate', entry })
      },
      {
          label: this._appLocalization.get('applications.content.bulkActions.moveTop'),
          command: () => this.onActionSelected.emit({ action: 'moveTop', entry }),
          disabled: rowIndex === 0
      },
      {
          label: this._appLocalization.get('applications.content.bulkActions.moveBottom'),
          command: () => this.onActionSelected.emit({ action: 'moveBottom', entry }),
          disabled: rowIndex + 1 === this._entries.length
      }
    ];
  }

  public _onSortChanged(event: { field: string, order: number}): void {
      if (event.field !== this._sortBy || event.order !== this._sortDirection) {
          this._sortBy = event.field;
          this._sortDirection = event.order;
          this.sortChanged.emit(event);
      }
  }

  public _goToEntry(entry: VidiunMediaEntry): void {
    if (this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_BASE)) {
        this._contentEntryViewService.open({ entry, section: ContentEntryViewSections.Metadata });
    }
  }

  public _openActionsMenu(event: any, rowIndex: number, entry: VidiunMediaEntry) {
    if (this.actionsMenu) {
      this._buildMenu(rowIndex, entry);
      this.actionsMenu.toggle(event);
    }
  }

  public _onSelectionChange(event) {
    this.selectedEntriesChange.emit(event);
  }

  public assignEmptyMessage(): void {
    this._emptyMessage = this._appLocalization.get('applications.content.playlistDetails.errors.addAtLeastOneMedia');
  }
}


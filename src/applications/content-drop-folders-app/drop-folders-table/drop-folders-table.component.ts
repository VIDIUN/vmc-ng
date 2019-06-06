import {
    AfterViewInit,
    ChangeDetectorRef,
    Component, ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Menu, MenuItem} from 'primeng/primeng';
import {VidiunDropFolderFile} from 'vidiun-ngx-client';
import {AppLocalization} from '@vidiun-ng/mc-shared';
import { globalConfig } from 'config/global';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/vmc-shared/columns-resize-manager';
import { DatePipe } from 'app-shared/vmc-shared/date-format/date.pipe';
import { BrowserService } from 'app-shared/vmc-shell';

@Component({
  selector: 'vDropFoldersListTable',
  templateUrl: './drop-folders-table.component.html',
  styleUrls: ['./drop-folders-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'dropfolders-table' }
    ]
})

export class DropFoldersTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedDropFolders: VidiunDropFolderFile[] = [];

  @Input() set dropFolders(data: VidiunDropFolderFile[]) {
    if (!this._deferredLoading) {
      this._dropFolders = [];
      this.cdRef.detectChanges();
      this._dropFolders = data || [];
      this.cdRef.detectChanges();
    } else {
      this._deferredDropFolders = data
    }
  }

  @Output() selectedDropFoldersChange = new EventEmitter<any>();
  @Output() navigateToEntry = new EventEmitter<string>();
  @Output() deleteDropFolderFiles = new EventEmitter<any>();
  @Output() sortChanged = new EventEmitter<any>();

  @ViewChild('actionsmenu') private actionsMenu: Menu;

  private _deferredDropFolders: VidiunDropFolderFile[];

  public _deferredLoading = true;
  public _dropFolders: VidiunDropFolderFile[] = [];
  public _items: MenuItem[];
  public _emptyMessage = '';
  public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
  public _vmcPermissions = VMCPermissions;

  constructor(public _columnsResizeManager: ColumnsResizeManagerService,
              private _appLocalization: AppLocalization,
              private _el: ElementRef<HTMLElement>,
              private cdRef: ChangeDetectorRef,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
      this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._dropFolders = this._deferredDropFolders;
        this._deferredDropFolders = null;
      }, 0);
    }

    this._columnsResizeManager.updateColumns(this._el.nativeElement);
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
  }

  private _buildMenu(rowIndex: number, folder: VidiunDropFolderFile): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.content.dropFolders.table.delete'),
        styleClass: 'vDanger',
        command: () => this._onActionSelected('remove', rowIndex, folder)
      }
    ];
  }

  private _onActionSelected(action: string, rowIndex: number, folder: VidiunDropFolderFile) {
    switch (action) {
      case 'remove':
        this.deleteDropFolderFiles.emit(folder);
        break;
      default:
        break;
    }
  }

  public _onSortChanged(event) {
    if (event.field && event.order) {
      // primeng workaround: must check that field and order was provided to prevent reset of sort value
      this.sortChanged.emit({field: event.field, order: event.order});
    }
  }

  public _openActionsMenu(event: any, rowIndex: number, folder: VidiunDropFolderFile) {
    if (this.actionsMenu) {
      this._buildMenu(rowIndex, folder);
      this.actionsMenu.toggle(event);
    }
  }

  public _dateTooltip(dropFolder: VidiunDropFolderFile) {
    return this._appLocalization.get('applications.content.dropFolders.table.datesTooltip',
      {
        0: dropFolder.uploadStartDetectedAt ? (new DatePipe(this._browserService)).transform(dropFolder.uploadStartDetectedAt.getTime(), 'dateAndTime') : this._appLocalization.get('applications.content.dropFolders.table.notAvailable'),
        1: dropFolder.uploadEndDetectedAt ? (new DatePipe(this._browserService)).transform(dropFolder.uploadEndDetectedAt.getTime(), 'dateAndTime') : this._appLocalization.get('applications.content.dropFolders.table.notAvailable'),
        2: dropFolder.importStartedAt ? (new DatePipe(this._browserService)).transform(dropFolder.importStartedAt.getTime(), 'dateAndTime') : this._appLocalization.get('applications.content.dropFolders.table.notAvailable'),
        3: dropFolder.importEndedAt ? (new DatePipe(this._browserService)).transform(dropFolder.importEndedAt.getTime(), 'dateAndTime') : this._appLocalization.get('applications.content.dropFolders.table.notAvailable')
      }
    );
  }
}


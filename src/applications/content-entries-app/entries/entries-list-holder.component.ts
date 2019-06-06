import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {EntriesListComponent} from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import {BrowserService, NewEntryUploadFile} from 'app-shared/vmc-shell';
import {EntriesStore} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import {AreaBlockerMessage} from '@vidiun-ng/vidiun-ui';
import {EntriesTableColumns} from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import {ContentEntriesAppService} from '../content-entries-app.service';
import { AppEventsService } from 'app-shared/vmc-shared';
import { PreviewAndEmbedEvent } from 'app-shared/vmc-shared/events';
import {UploadManagement} from '@vidiun-ng/vidiun-common';
import {TrackedFileStatuses} from '@vidiun-ng/vidiun-common';
import {UpdateEntriesListEvent} from 'app-shared/vmc-shared/events/update-entries-list-event';
import {PopupWidgetComponent} from '@vidiun-ng/vidiun-ui';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { EntriesListService } from './entries-list.service';
import {
    ContentEntryViewSections,
    ContentEntryViewService,
    ReachAppViewService,
    ReachPages
} from 'app-shared/vmc-shared/vmc-views/details-views';
import { LiveDashboardAppViewService } from 'app-shared/vmc-shared/vmc-views/component-views';
import { ContentEntriesMainViewService } from 'app-shared/vmc-shared/vmc-views';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { ClearEntriesSelectionEvent } from 'app-shared/vmc-shared/events/clear-entries-selection-event';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/vmc-shared/columns-resize-manager';

@Component({
  selector: 'vEntriesListHolder',
  templateUrl: './entries-list-holder.component.html',
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'entries-table' }
    ]
})
export class EntriesListHolderComponent implements OnInit, OnDestroy {
  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;
  @ViewChild('liveDashboard') _liveDashboard: PopupWidgetComponent;

  public _entryId: string = null;
  public _blockerMessage: AreaBlockerMessage = null;

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    id: { width: '120px' },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    plays: { sortable: true, width: '76px' },
    createdAt: { sortable: true, width: '140px' },
    duration: { sortable: true, width: '104px' },
    status: { width: '100px' }
  };

  public _rowActions = [
    {
      label: this._appLocalization.get('applications.content.table.previewAndEmbed'),
      commandName: 'preview',
      styleClass: ''
    },
    {
      label: this._appLocalization.get('applications.content.table.view'),
      commandName: 'view',
      styleClass: ''
    },
    {
      label: this._appLocalization.get('applications.content.table.liveDashboard'),
      commandName: 'liveDashboard',
      styleClass: '',
      disabled: !this._liveDashboardAppViewService.isAvailable()
    },
      {
          label: this._appLocalization.get('applications.content.table.captionRequest'),
          commandName: 'captionRequest'
      },
    {
      label: this._appLocalization.get('applications.content.table.delete'),
      commandName: 'delete',
      styleClass: 'vDanger'
    }
  ];

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _entriesListService: EntriesListService,
              private _browserService: BrowserService,
              private _appEvents: AppEventsService,
              private _appLocalization: AppLocalization,
              private _uploadManagement: UploadManagement,
              private _permissionsService: VMCPermissionsService,
              public _entriesStore: EntriesStore,
              private _contentEntryViewService: ContentEntryViewService,
              private _contentEntriesAppService: ContentEntriesAppService,
              private _contentEntriesMainViewService: ContentEntriesMainViewService,
              private _reachAppViewService: ReachAppViewService,
              private _liveDashboardAppViewService: LiveDashboardAppViewService) {
      _appEvents.event(ClearEntriesSelectionEvent)
          .pipe(cancelOnDestroy(this))
          .subscribe(() => {
              if (this._entriesList) {
                  this._entriesList.clearSelection();
              }
          });
  }

  ngOnInit() {
      if (this._contentEntriesMainViewService.viewEntered()) {
          this._prepare();
      }
  }

  ngOnDestroy() {

  }

  private _prepare(): void {
      if (this._entriesListService.isViewAvailable) {
          this._entriesStore.reload();
      }

      this._uploadManagement.onTrackedFileChanged$
          .pipe(cancelOnDestroy(this))
          .filter(trackedFile => trackedFile.data instanceof NewEntryUploadFile && trackedFile.status === TrackedFileStatuses.uploadCompleted)
          .subscribe(() => {
              this._entriesStore.reload();
          });

      this._appEvents.event(UpdateEntriesListEvent)
          .pipe(cancelOnDestroy(this))
          .subscribe(() => this._entriesStore.reload());

      const hasEmbedPermission = this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_EMBED_CODE);
      if (!hasEmbedPermission) {
          this._rowActions[0].label = this._appLocalization.get('applications.content.table.previewInPlayer');
      }
  }

  public _onActionSelected({ action, entry }) {
    switch (action) {
      case 'preview':
          this._entriesList.clearSelection();
        this._appEvents.publish(new PreviewAndEmbedEvent(entry));
        break;
      case 'view':
          this._entriesList.clearSelection();
          this._contentEntryViewService.open({ entry, section: ContentEntryViewSections.Metadata });
        break;
      case 'delete':
        this._browserService.confirm(
            {
              header: this._appLocalization.get('applications.content.entries.deleteEntry'),
              message: this._appLocalization.get('applications.content.entries.confirmDeleteSingle', { 0: entry.id }),
              accept: () => this._deleteEntry(entry.id)
            }
        );
        break;
      case 'liveDashboard':
        if (entry && entry.id) {
            this._entriesList.clearSelection();
          this._entryId = entry.id;
          this._liveDashboard.open();
        }
        break;

        case 'captionRequest':
            this._reachAppViewService.open({ entry, page: ReachPages.entry });
            break;
      default:
        break;
    }
  }

  private _deleteEntry(entryId: string): void {
    if (!entryId) {
      console.error('EntryId is not defined');
      return;
    }

    this._blockerMessage = null;
    this._contentEntriesAppService.deleteEntry(entryId)
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
            this._entriesList.clearSelection();
            this._entriesStore.reload();
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => this._deleteEntry(entryId)
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => this._blockerMessage = null
              }
            ]
          });
        }
      );
  }
}

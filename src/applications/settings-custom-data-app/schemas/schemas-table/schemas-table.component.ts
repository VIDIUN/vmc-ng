import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Menu, MenuItem } from 'primeng/primeng';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { SchemasStore } from '../schemas-store/schemas-store.service';
import { SettingsMetadataProfile } from '../schemas-store/settings-metadata-profile.interface';

@Component({
  selector: 'kSchemasTable',
  templateUrl: './schemas-table.component.html',
  styleUrls: ['./schemas-table.component.scss']
})
export class SchemasTableComponent implements AfterViewInit, OnDestroy {
  @Input() set schemas(data: SettingsMetadataProfile[]) {
    if (!this._deferredLoading) {
      this._schemas = [];
      this._cdRef.detectChanges();
      this._schemas = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredSchemas = data;
    }
  }

  @Input() selectedSchemas: SettingsMetadataProfile[] = [];

  @Output() selectedSchemasChange = new EventEmitter<any>();
  @Output() actionSelected = new EventEmitter<any>();

  @ViewChild('actionsmenu') private actionsMenu: Menu;

  private _deferredSchemas: SettingsMetadataProfile[];

  public _deferredLoading = true;
  public _emptyMessage = this._appLocalization.get('applications.content.table.noResults');
  public _blockerMessage: AreaBlockerMessage = null;
  public _items: MenuItem[];
  public _schemas: SettingsMetadataProfile[] = [];

  public rowTrackBy: Function = (index: number, item: any) => item.id;

  constructor(private _appLocalization: AppLocalization,
              public _schemasStore: SchemasStore,
              private _cdRef: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._schemas = this._deferredSchemas;
        this._deferredSchemas = null;
      }, 0);
    }
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
  }

  private _buildMenu(schema: SettingsMetadataProfile): void {
    const nonDisableSchemaActions = [
      {
        label: this._appLocalization.get('applications.settings.metadata.table.actions.edit'),
        command: () => this._onActionSelected('edit', schema)
      },
      {
        label: this._appLocalization.get('applications.settings.metadata.table.actions.download'),
        command: () => this._onActionSelected('download', schema)
      },
    ];

    this._items = [
      {
        label: this._appLocalization.get('applications.settings.metadata.table.actions.delete'),
        styleClass: 'kDanger',
        command: () => this._onActionSelected('delete', schema)
      }
    ];

    if (!schema.profileDisabled) {
      this._items = [...nonDisableSchemaActions, ...this._items];
    }
  }

  public _openActionsMenu(event: any, schema: SettingsMetadataProfile): void {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      this._buildMenu(schema);
      this.actionsMenu.show(event);
    }
  }
  public _onSelectionChange(event): void {
    this.selectedSchemasChange.emit(event);
  }

  public _onActionSelected(action: string, schema: SettingsMetadataProfile): void {
    this.actionSelected.emit({ action, schema });
  }

  public _schemaTableRowStyle(rowData: SettingsMetadataProfile): string {
    return rowData.profileDisabled ? 'kProfileDisabled' : '';
  }
}


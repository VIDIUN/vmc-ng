import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {VidiunCategory} from 'vidiun-ngx-client';
import {Menu, MenuItem} from 'primeng/primeng';
import {AreaBlockerMessage} from '@vidiun-ng/vidiun-ui';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vEntitlementsTable',
  templateUrl: './entitlement-table.component.html',
  styleUrls: ['./entitlement-table.component.scss']
})
export class EntitlementTableComponent implements OnInit, OnDestroy, AfterViewInit {

  public _entitlements: VidiunCategory[] = [];
  public _emptyMessage: string = this._appLocalization.get('applications.content.table.noResults');
  private _deferredEntitlements: VidiunCategory[];
  public _items: MenuItem[];
  public _deferredLoading = true;
  public _blockerMessage: AreaBlockerMessage = null;

  @Input()
  set entitlements(data: VidiunCategory[]) {
    if (!this._deferredLoading) {
      this._entitlements = [];
      this.cdRef.detectChanges();
      this._entitlements = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredEntitlements = data;
    }
  }

  @Output() onActionSelected = new EventEmitter<{ action: string, entitlement: VidiunCategory }>();
  @ViewChild('actionsmenu') private actionsMenu: Menu;


  constructor(private cdRef: ChangeDetectorRef,
              private _appLocalization: AppLocalization,
              private _permissionsService: VMCPermissionsService) {
  }

  public rowTrackBy: Function = (index: number, item: any) => item;

  public _openActionsMenu(event: any, category: VidiunCategory) {
    if (this.actionsMenu) {
      this._buildMenu(category);
      this.actionsMenu.toggle(event);
    }
  }


  private _buildMenu(entitlement: VidiunCategory): void {
    const hasEditPermission = this._permissionsService.hasPermission(VMCPermissions.INTEGRATION_UPDATE_SETTINGS);
    this._items = [
      {
        label: this._appLocalization.get('applications.settings.integrationSettings.entitlement.table.actions.edit'),
        disabled: !hasEditPermission,
        command: () => {
          this.onActionSelected.emit({action: 'edit', entitlement});
        }
      },
      {
        label: this._appLocalization.get('applications.settings.integrationSettings.entitlement.table.actions.delete'),
        disabled: !hasEditPermission,
        styleClass: 'vDanger',
        command: () => {
          this.onActionSelected.emit({action: 'delete', entitlement});
        }
      }
    ];
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this._deferredLoading = false;
        this._entitlements = this._deferredEntitlements;
        this._deferredEntitlements = null;
        this.cdRef.detectChanges();
      }, 0);
    }
  }

}

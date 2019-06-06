import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Menu, MenuItem} from 'primeng/primeng';
import {AppLocalization} from '@vidiun-ng/mc-shared';
import {VidiunPartner, VidiunPartnerStatus} from 'vidiun-ngx-client';
import {ColumnsResizeManagerService, ResizableColumnsTableName} from 'app-shared/vmc-shared/columns-resize-manager';
import {AppAuthentication} from "app-shared/vmc-shell";
import {globalConfig} from "config/global";

@Component({
  selector: 'vAccountsTable',
  templateUrl: './accounts-table.component.html',
  styleUrls: ['./accounts-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'accounts-table' }
    ]
})
export class AccountsTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input()
  set accounts(data: VidiunPartner[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of account
      // (ie when returning from entry page) - we should force detect changes on an empty list
      this._accounts = [];
      this._cdRef.detectChanges();
      this._accounts = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredAccounts = data;
    }
  }

  @Output() actionSelected = new EventEmitter<{action: string, account: VidiunPartner}>();
  @Output() sortChanged = new EventEmitter<any>();

  @ViewChild('actionsmenu') private _actionsMenu: Menu;

  private _deferredAccounts: VidiunPartner[];

  public _accounts: VidiunPartner[] = [];
  public _deferredLoading = true;
  public _emptyMessage = '';
  public _items: MenuItem[];
  public currentPartnerId = '';
  public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
  public _rowTrackBy: Function = (index: number, item: any) => item.id;

  constructor(private _appLocalization: AppLocalization,
              _appAuthentication: AppAuthentication,
              private _cdRef: ChangeDetectorRef,
              private _elementRef: ElementRef<HTMLElement>) {
      this.currentPartnerId = _appAuthentication.appUser.partnerId.toString();
  }

  ngOnInit() {
    this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._accounts = this._deferredAccounts;
        this._deferredAccounts = null;
      }, 0);
    }
  }

  private _onActionSelected(action: string, account: VidiunPartner): void {
    this.actionSelected.emit({ action, account });
  }

  private _buildMenu(partner: VidiunPartner): void {
      this._items = [];
      if ( partner.status !== VidiunPartnerStatus.blocked && partner.status !== VidiunPartnerStatus.fullBlock) {
          this._items.push({
                  id: 'vmc',
                  label: this._appLocalization.get('applications.administration.accounts.actions.vmc'),
                  command: () => this._onActionSelected('vmc', partner)
              });
      }
      if ( partner.id.toString() !== this.currentPartnerId) {
          if ( partner.status === VidiunPartnerStatus.blocked || partner.status === VidiunPartnerStatus.fullBlock) {
              this._items.push({
                  id: 'unblock',
                  label: this._appLocalization.get('applications.administration.accounts.actions.unblock'),
                  command: () => this._onActionSelected('unblock', partner)
              });
          } else {
              this._items.push({
                  id: 'block',
                  label: this._appLocalization.get('applications.administration.accounts.actions.block'),
                  command: () => this._onActionSelected('block', partner)
              });
          }
          this._items.push({
              id: 'remove',
              label: this._appLocalization.get('applications.administration.accounts.actions.remove'),
              styleClass: 'vDanger',
              command: () => this._onActionSelected('remove', partner)
          });
      }
  }

  public _openActionsMenu(event: any, account: VidiunPartner): void {
    if (this._actionsMenu) {
      this._buildMenu(account);
      this._actionsMenu.toggle(event);
    }
  }

    public _onSortChanged(event) {
        if (event.field && event.order) {
            // primeng workaround: must check that field and order was provided to prevent reset of sort value
            this.sortChanged.emit({field: event.field, order: event.order});
        }
    }
}


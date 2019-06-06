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
import { AppAuthentication, BrowserService } from 'app-shared/vmc-shell';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { UsersStore } from './users.service';
import { Menu, MenuItem } from 'primeng/primeng';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { VidiunUser } from 'vidiun-ngx-client';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/vmc-shared/columns-resize-manager';

export interface PartnerInfo {
  adminLoginUsersQuota: number,
  adminUserId: string
}

@Component({
  selector: 'vUsersTable',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'users-table' }
    ]
})
export class UsersTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('actionsmenu') private _actionsMenu: Menu;

  @Output() editUser = new EventEmitter<VidiunUser>();
  @Output() toggleUserStatus = new EventEmitter<VidiunUser>();
  @Output() deleteUser = new EventEmitter<VidiunUser>();

  private _partnerInfo: PartnerInfo = { adminLoginUsersQuota: 0, adminUserId: null };

  public _users: VidiunUser[] = [];
  public _deferredUsers: any[];
  public _items: MenuItem[];
  public _deferredLoading = true;
  public _blockerMessage: AreaBlockerMessage = null;
  public _rowTrackBy: Function = (index: number, item: any) => item.id;

  @Input() set users(data: any[]) {
    if (!this._deferredLoading) {
      this._users = [];
      this._cdRef.detectChanges();
      const newData = [...data];
      newData.forEach(user => {
        if (user.isAccountOwner && !newData[0].isAccountOwner) {
          const accountOwnerIndex = newData.findIndex(item => item.isAccountOwner);
          const accountOwner = newData[accountOwnerIndex];
          newData.splice(accountOwnerIndex, 1);
          newData.unshift(accountOwner);
        }
      });
      this._users = newData;
      this._cdRef.detectChanges();
    } else {
      this._deferredUsers = data;
    }
  }

  constructor(public _usersStore: UsersStore,
              public _columnsResizeManager: ColumnsResizeManagerService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization,
              private _permissionsService: VMCPermissionsService,
              private _browserService: BrowserService,
              private _el: ElementRef<HTMLElement>,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._usersStore.users.state$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          if (response.error) {
            this._blockerMessage = new AreaBlockerMessage({
              message: response.error,
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._blockerMessage = null;
                  this._usersStore.reload(true);
                }
              }]
            })
          }
        }
      );

    this._usersStore.users.data$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          if (response.partnerInfo) {
            this._partnerInfo = response.partnerInfo;
          }
        }
      );
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._users = this._deferredUsers;
        this._deferredUsers = null;
      }, 0);
    }

    this._columnsResizeManager.updateColumns(this._el.nativeElement);
  }

  ngOnDestroy() {
  }

  private _buildMenu(user: VidiunUser): void {

      this._items = [{
          id: 'edit', label: this._appLocalization.get('applications.content.table.edit'),
          command: () => this.editUser.emit(user)
      }];
      const isCurrentUser = this._appAuthentication.appUser.id === user.id;
      const isAdminUser = this._partnerInfo.adminUserId === user.id;
      if (!isCurrentUser && !isAdminUser) {
          this._items.push(
              {
                  id: 'blockUnblock', label: this._appLocalization.get('applications.content.table.blockUnblock'),
                  command: () => this.toggleUserStatus.emit(user)
              },
              {
                  id: 'delete', label: this._appLocalization.get('applications.content.table.delete'),
                  styleClass: 'vDanger', command: () => {
                  this._browserService.confirm({
                      header: this._appLocalization.get('applications.administration.users.deleteUser'),
                      message: this._appLocalization.get('applications.administration.users.confirmDelete', {0: user.fullName}),
                      accept: () => this.deleteUser.emit(user)
                  });
              }
              }
          );
          this._permissionsService.filterList(<{ id: string }[]>this._items,
              {
                  'delete': VMCPermissions.ADMIN_USER_DELETE,
                  'blockUnblock': VMCPermissions.ADMIN_USER_UPDATE,
                  'edit': VMCPermissions.ADMIN_USER_UPDATE,
              }
          );
      }
  }

  public _openActionsMenu(event: any, user: VidiunUser): void {
    if (this._actionsMenu) {
      this._buildMenu(user);
      this._actionsMenu.toggle(event);
    }
  }
}


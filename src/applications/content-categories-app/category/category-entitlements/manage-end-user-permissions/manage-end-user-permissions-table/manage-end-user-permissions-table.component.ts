import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {EndUserPermissionsUser} from '../manage-end-user-permissions.service';
import {VidiunCategoryUserPermissionLevel} from 'vidiun-ngx-client';
import {VidiunUpdateMethodType} from 'vidiun-ngx-client';
import {VidiunCategoryUserStatus} from 'vidiun-ngx-client';
import {UserActionData} from '../manage-end-user-permissions.component';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vManageEndUserPermissionsTable',
  templateUrl: './manage-end-user-permissions-table.component.html',
  styleUrls: ['./manage-end-user-permissions-table.component.scss']
})
export class ManageEndUserPermissionsTableComponent implements OnInit, AfterViewInit, OnDestroy {
  public _users: EndUserPermissionsUser[] = [];
  private _deferredUsers: any[];
  public _deferredLoading = true;
  public _vmcPermissions = VMCPermissions;

  @Input()
  set users(data: EndUserPermissionsUser[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of Users
      // (ie when returning from UserPermission page) - we should force detect changes on an empty list
      this._users = [];
      this.cdRef.detectChanges();
      this._users = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredUsers = data
    }
  }

  @Input() filter: any = {};
  @Input() selectedUsers: EndUserPermissionsUser[] = [];
  @Input() categoryInheritUserPermissions = false;
  @Input() isTagsBarVisible = false;

  @Output()
  sortChanged = new EventEmitter<any>();
  @Output()
  onActionSelected = new EventEmitter<UserActionData>();
  @Output()
  selectedUsersChange = new EventEmitter<any>();
  @Output()
  closeParentPopup = new EventEmitter<void>();

  public _permissionLevelOptions: { value: number, label: string }[] = [];
  public _updateMethodOptions: { value: number, label: string }[] = [];
  public _vidiunCategoryUserStatus = VidiunCategoryUserStatus;
  public _emptyMessage = '';

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor(private _appLocalization: AppLocalization,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
      this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
      this._fillPermissionLevelOptions();
    this._fillUpdateMethodOptions();
  }

  private _fillPermissionLevelOptions() {
    this._permissionLevelOptions = [{
      value: VidiunCategoryUserPermissionLevel.member,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.member')
    }, {
      value: VidiunCategoryUserPermissionLevel.contributor,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.contributor')
    }, {
      value: VidiunCategoryUserPermissionLevel.moderator,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.moderator')
    }, {
      value: VidiunCategoryUserPermissionLevel.manager,
      label: this._appLocalization.get('applications.content.categoryDetails.entitlements.defaultPermissionLevel.manager')
    }];
  }

  private _fillUpdateMethodOptions() {
    this._updateMethodOptions = [{
      value: VidiunUpdateMethodType.automatic,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.table.updateMethodOptions.automatic')
    }, {
      value: VidiunUpdateMethodType.manual,
      label: this._appLocalization
        .get('applications.content.categoryDetails.entitlements.usersPermissions.table.updateMethodOptions.manual')
    }];
  }

  ngOnDestroy() {
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
  }

  _onActionSelected(userActionData: UserActionData) {
    this.onActionSelected.emit(userActionData);

  }


  _onSelectionChange(event) {
    this.selectedUsersChange.emit(event);
  }

  _onSortChanged(event) {
    this.sortChanged.emit(event);
  }
}

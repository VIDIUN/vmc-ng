import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {MenuItem} from 'primeng/primeng';
import {VidiunCategoryUserPermissionLevel} from 'vidiun-ngx-client';
import {UserActionData} from '../manage-end-user-permissions.component';
import {VidiunUpdateMethodType} from 'vidiun-ngx-client';
import { EndUserPermissionsUser } from '../manage-end-user-permissions.service';

@Component({
  selector: 'vManageEndUserPermissionsBulkOperationsContent',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss']
})
export class ManageEndUserPermissionsBulkOperationsComponent implements OnInit {

  @Input() selectedItems: EndUserPermissionsUser[] = [];
  @Input() itemsTotalCount = 0;
  @Input() categoryInheritUserPermissions = false;

  @Output() addItem = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output()
  onActionSelected = new EventEmitter<UserActionData>();


  public _bulkActionsMenu: MenuItem[] = [];

  constructor(private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._bulkActionsMenu = this.getBulkActionItems();
  }


  getBulkActionItems(): MenuItem[] {
    return [
      {
        label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.active'), items: [
        { label: this._appLocalization.get('app.common.yes'), command: (event) => {
          this.onActionSelected.emit({action: 'activate', users: this.selectedItems, payload: {}});
        } },
        { label: this._appLocalization.get('app.common.no'), command: (event) => {
          this.onActionSelected.emit({action: 'deactivate', users: this.selectedItems, payload: {}});
        } }]
      },
      {
        label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevel'), items: [
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevelOptions.member'), command: (event) => {
          this.onActionSelected.emit({action: 'permissionLevel', users: this.selectedItems, payload: {level: VidiunCategoryUserPermissionLevel.member}});
        } },
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevelOptions.contributor'), command: (event) => {
          this.onActionSelected.emit({action: 'permissionLevel', users: this.selectedItems, payload: {level: VidiunCategoryUserPermissionLevel.contributor}});
        } },
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevelOptions.moderator'), command: (event) => {
          this.onActionSelected.emit({action: 'permissionLevel', users: this.selectedItems, payload: {level: VidiunCategoryUserPermissionLevel.moderator}});
        } },
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.setPermissionLevelOptions.manager'), command: (event) => {
          this.onActionSelected.emit({action: 'permissionLevel', users: this.selectedItems, payload: {level: VidiunCategoryUserPermissionLevel.manager}});
        } }]
      },
      {
        label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.updateMethod'), items: [
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.updateMethodOptions.automatic'), command: (event) => {

          this.onActionSelected.emit({action: 'updateMethod', users: this.selectedItems, payload: { method: VidiunUpdateMethodType.automatic}});
        } },
        { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.updateMethodOptions.manual'), command: (event) => {
          this.onActionSelected.emit({action: 'updateMethod', users: this.selectedItems, payload: { method: VidiunUpdateMethodType.manual}});
        } }]
      },
      { label: this._appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.bulkOperations.removeUsers'), command: (event) => {
          this._deleteItems();
      } }
    ];
  }

  public _deleteItems(): void {
    this.onActionSelected.emit({action: 'delete', users: this.selectedItems, payload: {}});
  }
}

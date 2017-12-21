import { UsersTableComponent } from './users-table.component';
import { StatusPipe } from './pipes/status.pipe';
import { RoleNamePipe } from './pipes/role-name.pipe';
import { UsersListComponent } from './users-list.component';
import { AccountOwnerPipe } from './pipes/account-owner.pipe';

export const UsersComponentsList = [
  UsersTableComponent,
  StatusPipe,
  RoleNamePipe,
  UsersListComponent,
  AccountOwnerPipe
];

import { Component } from '@angular/core';
import { UsersStore } from './users/users.service';


@Component({
  selector: 'vAdministrationUsers',
  templateUrl: './administration-users.component.html',
  styleUrls: ['./administration-users.component.scss'],
  providers: [UsersStore]
})
export class AdministrationUsersComponent {
}


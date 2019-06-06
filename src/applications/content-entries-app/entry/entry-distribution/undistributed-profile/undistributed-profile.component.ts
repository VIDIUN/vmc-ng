import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VidiunDistributionProfile } from 'vidiun-ngx-client';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vEntryUndistributedProfile',
  templateUrl: './undistributed-profile.component.html',
  styleUrls: ['./undistributed-profile.component.scss']
})
export class UndistributedProfileComponent {
  @Input() profile: VidiunDistributionProfile;

  @Output() onExport = new EventEmitter<VidiunDistributionProfile>();

  public _vmcPermissions = VMCPermissions;

  constructor(private _permissionsService: VMCPermissionsService) {

  }

  public _exportProfile(profile: VidiunDistributionProfile): void {
    if (this._permissionsService.hasPermission(VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_WHERE)) {
      this.onExport.emit(profile);
    }
  }
}


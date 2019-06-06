

import { Pipe } from '@angular/core';
import { VMCPermissionsService } from './vmc-permissions.service';
import { ActionPermittedPipeBase, Modes } from '@vidiun-ng/mc-shared';
import { VMCPermissions } from './vmc-permissions';

@Pipe({ name: 'vNgIfPermitted' })
export class NgIfPermittedPipe extends ActionPermittedPipeBase<VMCPermissions> {
    constructor(private _service: VMCPermissionsService) {
        super(Modes.AllowIfAnyExists);
    }

    protected hasAnyPermissions(permissionList: VMCPermissions[]): boolean {
        return this._service.hasAnyPermissions(permissionList);
    }
}

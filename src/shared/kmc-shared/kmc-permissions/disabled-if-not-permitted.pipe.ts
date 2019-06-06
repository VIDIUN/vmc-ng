

import { Pipe } from '@angular/core';
import { VMCPermissionsService } from './vmc-permissions.service';
import { ActionPermittedPipeBase, Modes } from '@vidiun-ng/mc-shared';
import { VMCPermissions } from './vmc-permissions';

@Pipe({ name: 'vDisabledIfNotPermitted' })
export class DisabledIfNotPermittedPipe extends ActionPermittedPipeBase<VMCPermissions> {
    constructor(private _service: VMCPermissionsService) {
        super(Modes.AllowIfNoneExists);
    }

    protected hasAnyPermissions(permissionList: VMCPermissions[]): boolean {
        return this._service.hasAnyPermissions(permissionList);
    }
}

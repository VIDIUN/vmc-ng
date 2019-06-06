import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryAccessControlWidget } from './entry-access-control-widget.service';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';


@Component({
    selector: 'vEntryAccessControl',
    templateUrl: './entry-access-control.component.html',
    styleUrls: ['./entry-access-control.component.scss']
})
export class EntryAccessControl implements  OnInit, OnDestroy {

	public _loading = false;
	public _loadingError = null;
	public _canSetAccessControl = false;
  public _vmcPermissions = VMCPermissions;

	constructor(public _widgetService: EntryAccessControlWidget,
              private _permissionsService: VMCPermissionsService) {
	}


	ngOnInit() {
        this._widgetService.attachForm();
    this._canSetAccessControl = this._permissionsService.hasAnyPermissions([VMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL]);
	}

	ngOnDestroy() {
        this._widgetService.detachForm();
	}
}


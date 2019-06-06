import { Component, Input, ViewChild } from '@angular/core';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { Flavor } from '../../flavor';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { AppLocalization } from '@vidiun-ng/mc-shared';

export type UploadMenuType = 'upload' | 'import' | 'link' | 'match';

@Component({
    selector: 'vFlavorReplaceMediaBtn',
    templateUrl: './replace-media-button.component.html',
    styleUrls: ['./replace-media-button.component.scss'],
    providers: [VidiunLogger.createLogger('ReplaceMediaButtonComponent')]
})
export class ReplaceMediaButtonComponent {
    @Input() entry: VidiunMediaEntry;
    @Input() flavors: Flavor[] = [];
    @Input() replaceButtonsLabel: string;

    @ViewChild('uploadMenu') _uploadMenu: PopupWidgetComponent;

    public _replaceType: UploadMenuType;
    public _uploadEnabled = false;
    public _importEnabled = false;
    public _linkEnabled = false;
    public _matchEnabled = false;

    constructor(private _appLocalization: AppLocalization,
                private _logger: VidiunLogger,
                private _permissionsService: VMCPermissionsService) {
        this._uploadEnabled = this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_UPLOAD)
            && this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_BASE);
        this._importEnabled = this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_BULK_UPLOAD)
            && this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_BASE);
        this._linkEnabled = this._permissionsService.hasPermission(VMCPermissions.FEATURE_REMOTE_STORAGE_INGEST)
            && this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_REMOTE_STORAGE)
            && this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_BASE);
        this._matchEnabled = this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_DROP_FOLDER_MATCH)
            && this._permissionsService.hasPermission(VMCPermissions.CONTENT_INGEST_BASE)
            && this._permissionsService.hasPermission(VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_DELETE);
    }

    public _openReplacementMenu(type: UploadMenuType): void {
        this._logger.info(`handle open replacement menu action by user`, { type });
        this._replaceType = type;
        this._uploadMenu.open();
    }
}


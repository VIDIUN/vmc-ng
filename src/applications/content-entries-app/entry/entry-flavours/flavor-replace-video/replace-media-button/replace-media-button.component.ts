import { Component, Input, ViewChild } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { Flavor } from '../../flavor';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

export type UploadMenuType = 'upload' | 'import' | 'link' | 'match';

@Component({
    selector: 'kFlavorReplaceMediaBtn',
    templateUrl: './replace-media-button.component.html',
    styleUrls: ['./replace-media-button.component.scss'],
    providers: [KalturaLogger.createLogger('ReplaceMediaButtonComponent')]
})
export class ReplaceMediaButtonComponent {
    @Input() entry: KalturaMediaEntry;
    @Input() flavors: Flavor[] = [];

    @ViewChild('uploadMenu') _uploadMenu: PopupWidgetComponent;
    @ViewChild('replaceVideoPopup') _replaceVideoPopup: PopupWidgetComponent;

    public _uploadFileLabel: string;
    public _importFileLabel: string;
    public _kmcPermissions = KMCPermissions;
    public _replaceType: UploadMenuType;

    public get _actionBtnTitle(): string {
        if (!this.entry) {
            return '';
        }

        if (this.entry.mediaType === KalturaMediaType.video) {
            return this.entry.status === KalturaEntryStatus.noContent
                ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.addVideo')
                : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replaceVideo');
        } else if (this.entry.mediaType === KalturaMediaType.audio) {
            return this.entry.status === KalturaEntryStatus.noContent
                ? this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.addAudio')
                : this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.replaceAudio');
        }
    }

    constructor(private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _permissionsService: KMCPermissionsService) {
        if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_MULTI_FLAVOR_INGESTION)) {
            this._uploadFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.uploadFiles');
            this._importFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.importFiles');
        } else {
            this._uploadFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.uploadFile');
            this._importFileLabel = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.importFile');
        }
    }

    public _openReplacementMenu(type: UploadMenuType): void {
        this._logger.info(`handle open replacement menu action by user`, { type });
        this._replaceType = type;
        this._replaceVideoPopup.close();
        this._uploadMenu.open();
    }
}


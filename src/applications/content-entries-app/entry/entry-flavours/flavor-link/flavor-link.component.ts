import { Component, Input, OnDestroy } from '@angular/core';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { Flavor } from '../flavor';
import { VidiunStorageProfile } from 'vidiun-ngx-client';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VidiunClient, VidiunMultiRequest } from 'vidiun-ngx-client';
import { VidiunRemoteStorageResource } from 'vidiun-ngx-client';
import { FlavorAssetSetContentAction } from 'vidiun-ngx-client';
import { EntryFlavoursWidget } from '../entry-flavours-widget.service';
import { BrowserService } from 'app-shared/vmc-shell';
import { Observable } from 'rxjs';
import { VidiunFlavorAsset } from 'vidiun-ngx-client';
import { FlavorAssetAddAction } from 'vidiun-ngx-client';
import { VidiunConversionProfileAssetParams } from 'vidiun-ngx-client';
import { VidiunFlavorReadyBehaviorType } from 'vidiun-ngx-client';
import { VidiunAssetParamsOrigin } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
    selector: 'vFlavorLink',
    templateUrl: './flavor-link.component.html',
    styleUrls: ['./flavor-link.component.scss'],
    providers: [VidiunLogger.createLogger('FlavorLinkComponent')]
})
export class FlavorLinkComponent implements OnDestroy {
    @Input() flavor: Flavor;
    @Input() storageProfile: VidiunStorageProfile;
    @Input() conversionProfileAsset: VidiunConversionProfileAssetParams;
    @Input() parentPopupWidget: PopupWidgetComponent;

    public _form: FormGroup;
    public _filePathField: AbstractControl;

    constructor(private _appLocalization: AppLocalization,
                private _logger: VidiunLogger,
                private _widgetService: EntryFlavoursWidget,
                private _vidiunClient: VidiunClient,
                private _browserService: BrowserService,
                private _fb: FormBuilder) {
        this._buildForm();
    }

    ngOnDestroy() {
    }

    private _buildForm(): void {
        this._form = this._fb.group({
            filePath: ['', Validators.required]
        });

        this._filePathField = this._form.controls['filePath'];
    }

    private _updateFlavorAction(): Observable<void> {
        this._logger.info(`handle update flavor request`, {
            fileUrl: this._form.value.filePath,
            flavorAssetId: this.flavor.flavorAsset.id
        });
        return this._vidiunClient
            .request(new FlavorAssetSetContentAction({
                id: this.flavor.flavorAsset.id,
                contentResource: new VidiunRemoteStorageResource({
                    url: this._form.value.filePath,
                    storageProfileId: this.storageProfile.id
                })
            }))
            .map(() => {
            });
    }

    private _uploadFlavorAction(): Observable<void> {
        this._logger.info(`handle upload flavor request, create asset and set its content`, {
            fileUrl: this._form.value.filePath,
        });
        const entryId = this._widgetService.data.id;
        const flavorAsset = new VidiunFlavorAsset({ flavorParamsId: this.flavor.flavorParams.id });
        const flavorAssetAddAction = new FlavorAssetAddAction({ entryId, flavorAsset });
        const flavorAssetSetContentAction = new FlavorAssetSetContentAction({
            id: '0',
            contentResource: new VidiunRemoteStorageResource({
                storageProfileId: this.storageProfile.id,
                url: this._form.value.filePath
            })
        }).setDependency(['id', 0, 'id']);

        return this._vidiunClient
            .multiRequest(new VidiunMultiRequest(flavorAssetAddAction, flavorAssetSetContentAction))
            .map(responses => {
                if (responses.hasErrors()) {
                    throw new Error(responses.reduce((acc, val) => `${acc}\n${val.error ? val.error.message : ''}`, ''));
                }
                return undefined;
            });
    }

    private _validate(): boolean {
        const asset = this.conversionProfileAsset;
        if (!asset || asset.readyBehavior !== VidiunFlavorReadyBehaviorType.required || asset.origin !== VidiunAssetParamsOrigin.ingest) {
            return true;
        }

        return asset.assetParamsId === this.flavor.flavorParams.id;
    }

    private _performAction(): void {
        const linkAction = this.flavor.flavorAsset && this.flavor.flavorAsset.id ? this._updateFlavorAction() : this._uploadFlavorAction();
        linkAction
            .pipe(tag('block-shell'))
            .pipe(cancelOnDestroy(this))
            .subscribe(
                () => {
                    this._logger.info(`handle successful link action, reload flavors data`);
                    this.parentPopupWidget.close();
                    this._widgetService.refresh();
                },
                error => {
                    this._logger.warn(`handle failed link action, show alert`, { errorMessage: error.message });
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        accept: () => {
                            this._logger.info(`user dismissed alert, reload flavors data`);
                            this.parentPopupWidget.close();
                            this._widgetService.refresh();
                        }
                    });
                });
    }

    public _link(): void {
        this._logger.info(`handle link action by user`);
        if (this._form.valid) {
            this._logger.info(`validate asset params`, { asset: this.conversionProfileAsset });
            if (this._validate()) {
                this._performAction();
            } else {
                this._logger.info(`asset params is not valid, show confirmation`);
                this._browserService.confirm({
                    header: this._appLocalization.get('app.common.attention'),
                    message: this._appLocalization.get('applications.content.entryDetails.flavours.link.requiredFlavorsMissing'),
                    accept: () => {
                        this._logger.info(`user confirmed proceed action`);
                        this._performAction();
                    },
                    reject: () => {
                        this._logger.info(`user didn't confirm abort action`);
                    }
                });
            }
        } else {
            this._logger.info(`form is not valid, abort action`);
        }
    }
}


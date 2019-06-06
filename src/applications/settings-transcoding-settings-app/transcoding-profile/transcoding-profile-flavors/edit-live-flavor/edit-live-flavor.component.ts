import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import {
  ExtendedVidiunConversionProfileAssetParams,
  VidiunConversionProfileWithAsset
} from '../../../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';
import { VidiunFlavorParams } from 'vidiun-ngx-client';
import { VidiunConversionProfileAssetParams } from 'vidiun-ngx-client';
import { VidiunObjectBaseFactory } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'vEditLiveFlavor',
  templateUrl: './edit-live-flavor.component.html',
  styleUrls: ['./edit-live-flavor.component.scss'],
  providers: [VidiunLogger.createLogger('EditLiveFlavorComponent')]
})
export class EditLiveFlavorComponent implements OnInit {
  @Input() profile: VidiunConversionProfileWithAsset;
  @Input() flavor: VidiunFlavorParams;
  @Input() parentPopupWidget: PopupWidgetComponent;

  @Output() saveFlavor = new EventEmitter<ExtendedVidiunConversionProfileAssetParams>();

  private _assetParams: ExtendedVidiunConversionProfileAssetParams;

  public _editFlavorForm: FormGroup;
  public _profileNameField: AbstractControl;
  public _flavorNameField: AbstractControl;
  public _systemNameField: AbstractControl;

  constructor(private _fb: FormBuilder,
              private _logger: VidiunLogger) {
    this._buildForm();
  }

  ngOnInit() {
    this._assetParams = null;

    if (this.profile && this.flavor) {
      this._prepare();
    }
  }

  private _prepare(): void {
    this._logger.info(`enter edit live flavor mode`);
    const assetParams = this._getFlavorAssetParams();

    if (!assetParams.systemName) {
      assetParams.systemName = this.flavor.systemName || '';
    }

    this._assetParams = assetParams;

    this._editFlavorForm.setValue({
      profileName: this.profile.name,
      flavorName: this.flavor.name,
      systemName: assetParams.systemName,
    }, { emitEvent: false });
  }

  private _getFlavorAssetParams(): ExtendedVidiunConversionProfileAssetParams {
    const assets = this.profile.assets || [];
    const relevantAssetParam = assets.find(({ assetParamsId }) => this.flavor.id === assetParamsId);
    if (relevantAssetParam instanceof VidiunConversionProfileAssetParams) {
      return Object.assign(VidiunObjectBaseFactory.createObject(relevantAssetParam), relevantAssetParam);
    }

    const newAssetParam: ExtendedVidiunConversionProfileAssetParams = new VidiunConversionProfileAssetParams();
    // bypass readonly mode
    (<any>newAssetParam).conversionProfileId = this.profile.id;
    (<any>newAssetParam).assetParamsId = this.flavor.id;
    newAssetParam.updated = true;

    return newAssetParam;
  }

  private _buildForm(): void {
    this._editFlavorForm = this._fb.group({
      profileName: '',
      flavorName: '',
      systemName: '',
    });

    this._profileNameField = this._editFlavorForm.controls['profileName'];
    this._flavorNameField = this._editFlavorForm.controls['flavorName'];
    this._systemNameField = this._editFlavorForm.controls['systemName'];

    this._profileNameField.disable({ onlySelf: true });
    this._flavorNameField.disable({ onlySelf: true });
  }

  public _saveFlavor(): void {
    this._logger.info(`handle save flavor action by user`);
    const assetParams = this._assetParams;
    const formData = this._editFlavorForm.value;

    assetParams.systemName = formData.systemName;
    assetParams.updated = this._editFlavorForm.dirty;

    this.saveFlavor.emit(assetParams);
    this.parentPopupWidget.close();
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaFlavorReadyBehaviorType } from 'kaltura-ngx-client/api/types/KalturaFlavorReadyBehaviorType';
import { KalturaAssetParamsOrigin } from 'kaltura-ngx-client/api/types/KalturaAssetParamsOrigin';
import { KalturaNullableBoolean } from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';
import { KalturaAssetParamsDeletePolicy } from 'kaltura-ngx-client/api/types/KalturaAssetParamsDeletePolicy';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaConversionProfileWithAsset } from '../../../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { KalturaConversionProfileAssetParams } from 'kaltura-ngx-client/api/types/KalturaConversionProfileAssetParams';
import { KalturaTypesFactory } from 'kaltura-ngx-client';

@Component({
  selector: 'kEditMediaFlavor',
  templateUrl: './edit-media-flavor.component.html',
  styleUrls: ['./edit-media-flavor.component.scss']
})
export class EditMediaFlavorComponent implements OnInit {
  @Input() profile: KalturaConversionProfileWithAsset;
  @Input() flavor: KalturaFlavorParams;
  @Input() parentPopupWidget: PopupWidgetComponent;

  @Output() saveFlavor = new EventEmitter<KalturaConversionProfileAssetParams>();

  private _assetParams: KalturaConversionProfileAssetParams;

  public _availabilityOptions = [
    {
      value: KalturaFlavorReadyBehaviorType.inheritFlavorParams,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.noImpact')
    },
    {
      value: KalturaFlavorReadyBehaviorType.required,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.required')
    },
    {
      value: KalturaFlavorReadyBehaviorType.optional,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.optional')
    }
  ];
  public _originOptions = [
    {
      value: KalturaAssetParamsOrigin.convert,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.always')
    },
    {
      value: KalturaAssetParamsOrigin.convertWhenMissing,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.asAFallback')
    },
    {
      value: KalturaAssetParamsOrigin.ingest,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.never')
    }
  ];
  public _genOptions = [
    {
      value: KalturaNullableBoolean.falseValue,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.useKalturaOptimization')
    },
    {
      value: KalturaNullableBoolean.trueValue,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.forceFlavorGeneration')
    },
  ];
  public _handleOptions = [
    {
      value: KalturaAssetParamsDeletePolicy.keep,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.keepFlavor')
    },
    {
      value: KalturaAssetParamsDeletePolicy.delete,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.deleteFlavor')
    },
  ];
  public _editFlavorForm: FormGroup;
  public _profileNameField: AbstractControl;
  public _flavorNameField: AbstractControl;
  public _readyBehaviorField: AbstractControl;
  public _originField: AbstractControl;
  public _systemNameField: AbstractControl;
  public _forceNoneCompliedField: AbstractControl;
  public _deletePolicyField: AbstractControl;

  constructor(private _fb: FormBuilder,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  ngOnInit() {
    this._assetParams = null;

    if (this.profile && this.flavor) {
      this._prepare();
    }
  }

  private _prepare(): void {
    const assetParams = this._getFlavorAssetParams();

    // default values:
    const isSourceAssetParam = this.flavor.tags && this.flavor.tags.indexOf('source') > -1;
    if (isSourceAssetParam) {
      assetParams.origin = KalturaAssetParamsOrigin.ingest;
      if (typeof assetParams.readyBehavior === 'undefined') {
        assetParams.readyBehavior = KalturaFlavorReadyBehaviorType.inheritFlavorParams;
      }
      this._originField.disable({ onlySelf: true });
    }

    if (this.flavor.id === 0) {
      this._forceNoneCompliedField.disable({ onlySelf: true });
      assetParams.forceNoneComplied = KalturaNullableBoolean.falseValue;
    }

    if (typeof assetParams.readyBehavior === 'undefined') {
      assetParams.readyBehavior = KalturaFlavorReadyBehaviorType.optional;
    }

    if (typeof assetParams.origin === 'undefined') {
      assetParams.origin = KalturaAssetParamsOrigin.convert;
    }

    if (!assetParams.systemName) {
      assetParams.systemName = this.flavor.systemName || '';
    }

    if (typeof assetParams.forceNoneComplied === 'undefined') {
      assetParams.forceNoneComplied = KalturaNullableBoolean.falseValue;
    }

    if (typeof assetParams.deletePolicy === 'undefined') {
      assetParams.deletePolicy = KalturaAssetParamsDeletePolicy.keep;
    }

    this._assetParams = assetParams;

    this._editFlavorForm.setValue({
      profileName: this.profile.name,
      flavorName: this.flavor.name,
      readyBehavior: assetParams.readyBehavior,
      origin: assetParams.origin,
      systemName: assetParams.systemName,
      forceNoneComplied: assetParams.forceNoneComplied,
      deletePolicy: assetParams.deletePolicy
    }, { emitEvent: false });
  }

  private _getFlavorAssetParams(): KalturaConversionProfileAssetParams {
    const assets = this.profile.assets || [];
    const relevantAssetParam = assets.find(({ assetParamsId }) => this.flavor.id === assetParamsId);
    if (relevantAssetParam instanceof KalturaConversionProfileAssetParams) {
      return Object.assign(KalturaTypesFactory.createObject(relevantAssetParam), relevantAssetParam);
    }

    const newAssetParam = new KalturaConversionProfileAssetParams();
    // bypass readonly mode
    (<any>newAssetParam).conversionProfileId = this.profile.id;
    (<any>newAssetParam).assetParamsId = this.flavor.id;

    return newAssetParam;
  }

  private _buildForm(): void {
    this._editFlavorForm = this._fb.group({
      profileName: '',
      flavorName: '',
      readyBehavior: null,
      origin: null,
      systemName: '',
      forceNoneComplied: null,
      deletePolicy: null
    });

    this._profileNameField = this._editFlavorForm.controls['profileName'];
    this._flavorNameField = this._editFlavorForm.controls['flavorName'];
    this._readyBehaviorField = this._editFlavorForm.controls['readyBehavior'];
    this._originField = this._editFlavorForm.controls['origin'];
    this._systemNameField = this._editFlavorForm.controls['systemName'];
    this._forceNoneCompliedField = this._editFlavorForm.controls['forceNoneComplied'];
    this._deletePolicyField = this._editFlavorForm.controls['deletePolicy'];

    this._profileNameField.disable({ onlySelf: true });
    this._flavorNameField.disable({ onlySelf: true });
  }

  public _saveFlavor(): void {
    const assetParams = this._assetParams;
    const formData = this._editFlavorForm.getRawValue();

    assetParams.readyBehavior = formData.readyBehavior;
    assetParams.origin = formData.origin;
    assetParams.systemName = formData.systemName;
    assetParams.forceNoneComplied = formData.forceNoneComplied;
    assetParams.deletePolicy = formData.deletePolicy;

    this.saveFlavor.emit(assetParams);
    this.parentPopupWidget.close();
  }
}

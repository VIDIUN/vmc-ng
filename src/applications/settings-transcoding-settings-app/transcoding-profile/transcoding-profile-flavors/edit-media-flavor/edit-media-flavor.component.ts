import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { VidiunFlavorReadyBehaviorType } from 'vidiun-ngx-client';
import { VidiunAssetParamsOrigin } from 'vidiun-ngx-client';
import { VidiunNullableBoolean } from 'vidiun-ngx-client';
import { VidiunAssetParamsDeletePolicy } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {
  ExtendedVidiunConversionProfileAssetParams,
  VidiunConversionProfileWithAsset
} from '../../../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';
import { VidiunFlavorParams } from 'vidiun-ngx-client';
import { VidiunConversionProfileAssetParams } from 'vidiun-ngx-client';
import { VidiunObjectBaseFactory } from 'vidiun-ngx-client';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'vEditMediaFlavor',
  templateUrl: './edit-media-flavor.component.html',
  styleUrls: ['./edit-media-flavor.component.scss'],
  providers: [VidiunLogger.createLogger('EditMediaFlavorComponent')]
})
export class EditMediaFlavorComponent implements OnInit {
  @Input() profile: VidiunConversionProfileWithAsset;
  @Input() flavor: VidiunFlavorParams;
  @Input() parentPopupWidget: PopupWidgetComponent;

  @Output() saveFlavor = new EventEmitter<ExtendedVidiunConversionProfileAssetParams>();

  private _assetParams: ExtendedVidiunConversionProfileAssetParams;

  public _vmcPermissions = VMCPermissions;
  public _availabilityOptions = [
    {
      value: VidiunFlavorReadyBehaviorType.inheritFlavorParams,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.noImpact')
    },
    {
      value: VidiunFlavorReadyBehaviorType.required,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.required')
    },
    {
      value: VidiunFlavorReadyBehaviorType.optional,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.optional')
    }
  ];
  public _originOptions = [
    {
      value: VidiunAssetParamsOrigin.convert,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.always')
    },
    {
      value: VidiunAssetParamsOrigin.convertWhenMissing,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.asAFallback')
    },
    {
      value: VidiunAssetParamsOrigin.ingest,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.never')
    }
  ];
  public _genOptions = [
    {
      value: VidiunNullableBoolean.falseValue,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.useVidiunOptimization')
    },
    {
      value: VidiunNullableBoolean.trueValue,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.forceFlavorGeneration')
    },
  ];
  public _handleOptions = [
    {
      value: VidiunAssetParamsDeletePolicy.keep,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.keepFlavor')
    },
    {
      value: VidiunAssetParamsDeletePolicy.delete,
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
              private _permissionsService: VMCPermissionsService,
              private _logger: VidiunLogger,
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
    this._logger.info(`enter edit media flavor mode`);
    const assetParams = this._getFlavorAssetParams();

    // default values:
    const isSourceAssetParam = this.flavor.tags && this.flavor.tags.indexOf('source') > -1;
    if (isSourceAssetParam) {
      assetParams.origin = VidiunAssetParamsOrigin.ingest;
      if (typeof assetParams.readyBehavior === 'undefined') {
        assetParams.readyBehavior = VidiunFlavorReadyBehaviorType.inheritFlavorParams;
      }
      this._originField.disable({ onlySelf: true });
    }

    if (this.flavor.id === 0) {
      this._forceNoneCompliedField.disable({ onlySelf: true });
      assetParams.forceNoneComplied = VidiunNullableBoolean.falseValue;
    }

    if (typeof assetParams.readyBehavior === 'undefined') {
      assetParams.readyBehavior = VidiunFlavorReadyBehaviorType.optional;
    }

    if (typeof assetParams.origin === 'undefined') {
      assetParams.origin = VidiunAssetParamsOrigin.convert;
    }

    if (!assetParams.systemName) {
      assetParams.systemName = this.flavor.systemName || '';
    }

    if (typeof assetParams.forceNoneComplied === 'undefined') {
      assetParams.forceNoneComplied = VidiunNullableBoolean.falseValue;
    }

    if (typeof assetParams.deletePolicy === 'undefined') {
      assetParams.deletePolicy = VidiunAssetParamsDeletePolicy.keep;
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

    if (!this._permissionsService.hasPermission(VMCPermissions.FEATURE_MULTI_FLAVOR_INGESTION)) {
        this._editFlavorForm.get('systemName').disable({onlySelf: true});
        this._originField.disable({onlySelf: true});
    }
  }

  private _getFlavorAssetParams(): ExtendedVidiunConversionProfileAssetParams {
    const assets = this.profile.assets || [];
    const relevantAssetParam = assets.find(({ assetParamsId }) => this.flavor.id === assetParamsId);
    if (relevantAssetParam instanceof VidiunConversionProfileAssetParams) {
      return Object.assign(VidiunObjectBaseFactory.createObject(relevantAssetParam), relevantAssetParam);
    }

    const newAssetParam = new VidiunConversionProfileAssetParams();
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
    this._logger.info(`handle save flavor action by user`);
    const assetParams = this._assetParams;
    const formData = this._editFlavorForm.getRawValue();

    assetParams.readyBehavior = formData.readyBehavior;
    assetParams.origin = formData.origin;
    assetParams.systemName = formData.systemName;
    assetParams.forceNoneComplied = formData.forceNoneComplied;
    assetParams.updated = this._editFlavorForm.dirty;

    if (this._permissionsService.hasPermission(VMCPermissions.WIDEVINE_PLUGIN_PERMISSION)) {
      assetParams.deletePolicy = formData.deletePolicy;
    }

    this.saveFlavor.emit(assetParams);
    this.parentPopupWidget.close();
  }
}

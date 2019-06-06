import { Component, Input, OnDestroy } from '@angular/core';
import { VidiunDistributionValidationError } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorInvalidData } from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunDistributionValidationErrorType } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorMissingMetadata } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorMissingFlavor } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorMissingThumbnail } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorConditionNotMet } from 'vidiun-ngx-client';
import { EntryDistributionWidget } from '../entry-distribution-widget.service';
import { EntryStore } from '../../entry-store.service';
import { ContentEntryViewSections } from 'app-shared/vmc-shared/vmc-views/details-views/content-entry-view.service';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
  selector: 'vEntryDistributedProfileErrorInfo',
  templateUrl: './distributed-profile-error-info.component.html',
  styleUrls: ['./distributed-profile-error-info.component.scss']
})
export class DistributedProfileErrorInfoComponent implements OnDestroy {
  @Input() set errors(value: { type: string, errors: VidiunDistributionValidationError[] }) {
    if (value) {
      this._parseError(value.type, value.errors);
    }
  }

  public _errorInfo = '';
  public _goToLabel = '';
  public _goToLink: ContentEntryViewSections = null;

  constructor(private _appLocalization: AppLocalization,
              private _widget: EntryDistributionWidget,
              private _entryStore: EntryStore) {

  }

  ngOnDestroy() {

  }

  private _parseError(type: string, errors: VidiunDistributionValidationError[]): void {
    switch (type) {
      case 'metadataError':
        this._handleMetadataError(<VidiunDistributionValidationErrorInvalidData[]>errors);
        break;

      case 'missingMetadata':
        this._handleMissingMetadata(<VidiunDistributionValidationErrorMissingMetadata[]>errors);
        break;

      case 'missingFlavor':
        this._handleMissingFlavor(<VidiunDistributionValidationErrorMissingFlavor[]>errors);
        break;

      case 'missingThumbnail':
        this._handleMissingThumbnail(<VidiunDistributionValidationErrorMissingThumbnail[]>errors);
        break;

      case 'autoDistributionMetadataMissing':
        this._handleAutoDistributionMetadataMissing(<VidiunDistributionValidationErrorConditionNotMet[]>errors);
        break;


      default:
        break;
    }
  }

  private _handleMetadataError(errors: VidiunDistributionValidationErrorInvalidData[]): void {
    let details = '';
    errors.forEach(error => {
      switch (error.validationErrorType) {
        case VidiunDistributionValidationErrorType.stringEmpty:
          details += this._appLocalization.get(
            'applications.content.entryDetails.distribution.errorTypes.stringEmpty',
            [error.fieldName]
          );
          break;

        case VidiunDistributionValidationErrorType.stringTooLong:
          details += this._appLocalization.get(
            'applications.content.entryDetails.distribution.errorTypes.stringTooLong',
            [error.fieldName, error.validationErrorParam]
          );
          break;

        case VidiunDistributionValidationErrorType.stringTooShort:
          details += this._appLocalization.get(
            'applications.content.entryDetails.distribution.errorTypes.stringTooShort',
            [error.fieldName, error.validationErrorParam]
          );
          break;

        case VidiunDistributionValidationErrorType.invalidFormat:
          details += this._appLocalization.get(
            'applications.content.entryDetails.distribution.errorTypes.stringEmpty',
            [error.fieldName, error.validationErrorParam]
          );
          break;

        case VidiunDistributionValidationErrorType.customError:
          details += `${error.fieldName} - ${error.validationErrorParam}\n`;
          break;

        default:
          break;
      }
    });

    this._errorInfo = this._appLocalization.get(
      'applications.content.entryDetails.distribution.errorsInfo.metadataError',
      [details]
    );
    this._goToLabel = this._appLocalization.get(
      'applications.content.entryDetails.distribution.errorsInfo.goToMetadataTab'
    );
    this._goToLink = ContentEntryViewSections.Metadata;
  }

  private _handleMissingMetadata(errors: VidiunDistributionValidationErrorMissingMetadata[]): void {
    const details = errors.map(({ fieldName }) => `${fieldName}`).join('\n');
    this._errorInfo = this._appLocalization.get(
      'applications.content.entryDetails.distribution.errorsInfo.missingMetadata',
      [details]
    );
    this._goToLabel = this._appLocalization.get(
      'applications.content.entryDetails.distribution.errorsInfo.goToMetadataTab'
    );
    this._goToLink = ContentEntryViewSections.Metadata;
  }

  private _handleMissingFlavor(errors: VidiunDistributionValidationErrorMissingFlavor[]): void {
    /* Go through the loaded flavors list and find the flavor in which
       Flavor.paramsId === VidiunDistributionValidationErrorMissingFlavor.flavorParamsId.
       Add this Flavor.name to the list of flavor names.
    */
    this._widget.flavors$
      .pipe(cancelOnDestroy(this))
      .subscribe(({ items }) => {
        const details = errors.map(error => {
          const relevantFlavor = items.find(flavor => String(flavor.paramsId) === error.flavorParamsId);
          if (relevantFlavor) {
            return `${relevantFlavor.name}`;
          }
        }).join('\n');

        this._errorInfo = this._appLocalization.get(
          'applications.content.entryDetails.distribution.errorsInfo.missingFlavor',
          [details]
        );
        this._goToLabel = this._appLocalization.get(
          'applications.content.entryDetails.distribution.errorsInfo.goToFlavorsTab'
        );
        this._goToLink = ContentEntryViewSections.Flavours;
      });
  }

  private _handleMissingThumbnail(errors: VidiunDistributionValidationErrorMissingThumbnail[]): void {
    const details = errors.map(({ dimensions }) => `${dimensions.width} X ${dimensions.height}`).join('\n');
    this._errorInfo = this._appLocalization.get(
      'applications.content.entryDetails.distribution.errorsInfo.missingThumbnail',
      [details]
    );
    this._goToLabel = this._appLocalization.get(
      'applications.content.entryDetails.distribution.errorsInfo.goToThumbnailsTab'
    );
    this._goToLink = ContentEntryViewSections.Thumbnails;
  }

  private _handleAutoDistributionMetadataMissing(errors: VidiunDistributionValidationErrorConditionNotMet[]): void {
    const details = errors.map(({ conditionName }) => `${conditionName}`).join('\n');
    this._errorInfo = this._appLocalization.get(
      'applications.content.entryDetails.distribution.errorsInfo.autoDistributionMetadataMissing',
      [details]
    );
    this._goToLabel = this._appLocalization.get(
      'applications.content.entryDetails.distribution.errorsInfo.goToMetadataTab'
    );
    this._goToLink = ContentEntryViewSections.Metadata;
  }

  public _openSection(): void {
    this._entryStore.openSection(this._goToLink);
  }
}

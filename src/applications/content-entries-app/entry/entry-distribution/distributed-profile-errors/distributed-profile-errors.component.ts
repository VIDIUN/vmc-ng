import { Component, Input } from '@angular/core';
import { VidiunDistributionValidationError } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorConditionNotMet } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorMissingThumbnail } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorMissingMetadata } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorMissingFlavor } from 'vidiun-ngx-client';
import { VidiunDistributionValidationErrorInvalidData } from 'vidiun-ngx-client';
import { OverlayPanel } from 'primeng/primeng';

export interface DistributedProfileErrorsGroup {
  [key: string]: VidiunDistributionValidationError[]
}

@Component({
  selector: 'vEntryDistributedProfileErrors',
  templateUrl: './distributed-profile-errors.component.html',
  styleUrls: ['./distributed-profile-errors.component.scss']
})
export class DistributedProfileErrorsComponent {
  @Input() set errors(value: VidiunDistributionValidationError[]) {
    if (value && value.length) {
      this._errors = this._mapErrors(value);
      this._errorsKeys = Object.keys(this._errors);
    }
  }

  public _errors: DistributedProfileErrorsGroup;
  public _errorsKeys: string[] = [];
  public _selectedErrorGroup: { type: string, errors: VidiunDistributionValidationError[] };

  private _mapErrors(errors: VidiunDistributionValidationError[]): DistributedProfileErrorsGroup {
    const updateErrorType = (acc, val, type) => {
      if (typeof acc === "undefined"){
          acc = {};
      }
      if (!acc[type]) {
        return Object.assign(acc, { [type]: [val] });
      }
      return Object.assign(acc, { [type]: [...acc[type], val] });
    };

    return errors.reduce((acc, val) => {
      switch (true) {
        case val instanceof VidiunDistributionValidationErrorInvalidData:
          return updateErrorType(acc, val, 'metadataError');

        case val instanceof VidiunDistributionValidationErrorMissingMetadata:
          return updateErrorType(acc, val, 'missingMetadata');

        case val instanceof VidiunDistributionValidationErrorMissingFlavor:
          return updateErrorType(acc, val, 'missingFlavor');

        case val instanceof VidiunDistributionValidationErrorMissingThumbnail:
          return updateErrorType(acc, val, 'missingThumbnail');

        case val instanceof VidiunDistributionValidationErrorConditionNotMet:
          return updateErrorType(acc, val, 'autoDistributionMetadataMissing');

        default:
          break;
      }
    }, {})
  }

  public _toggleErrorInfo($event: Event, errorGroup: VidiunDistributionValidationError[], type: string, panel: OverlayPanel): void {
    this._selectedErrorGroup = { type, errors: errorGroup };
    panel.toggle($event);
  }
}

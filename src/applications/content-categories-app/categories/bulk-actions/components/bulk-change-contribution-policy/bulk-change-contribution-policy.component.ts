import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PopupWidgetComponent} from '@vidiun-ng/vidiun-ui';
import {VidiunContributionPolicyType} from 'vidiun-ngx-client';

@Component({
  selector: 'vCategoriesBulkChangeContributionPolicy',
  templateUrl: './bulk-change-contribution-policy.component.html',
  styleUrls: ['./bulk-change-contribution-policy.component.scss']
})

export class CategoriesBulkChangeContributionPolicy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() changeContributionPolicyChanged = new EventEmitter<VidiunContributionPolicyType>();
  public _selectedPolicy: VidiunContributionPolicyType = null;
  public _availablePolicies = VidiunContributionPolicyType;

  constructor() {
  }

  public _apply() {
    this.changeContributionPolicyChanged.emit(this._selectedPolicy);
    this.parentPopupWidget.close();
  }
}


import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {VidiunOperaSyndicationFeed} from 'vidiun-ngx-client';
import { DestinationComponentBase, FeedFormMode } from '../../feed-details.component';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vOperaDestinationForm',
  templateUrl: './opera-destination-form.component.html',
  styleUrls: ['./opera-destination-form.component.scss'],
  providers: [{provide: DestinationComponentBase, useExisting: OperaDestinationFormComponent}]
})
export class OperaDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {
  @Input() mode: FeedFormMode;

  @Output()
  onFormStateChanged = new EventEmitter<{ isValid: boolean, isDirty: boolean }>();

  constructor(private _permissionsService: VMCPermissionsService) {
    super();
  }

  ngOnInit() {
    if (this.mode !== 'edit' || this._permissionsService.hasPermission(VMCPermissions.SYNDICATION_UPDATE)) {
      this.onFormStateChanged.emit({
        isValid: true,
        isDirty: false
      });
    }
  }

  ngOnDestroy() {
  }

  public getData(): VidiunOperaSyndicationFeed {
    return new VidiunOperaSyndicationFeed();
  }
}

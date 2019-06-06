import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {VidiunRokuSyndicationFeed} from 'vidiun-ngx-client';
import { DestinationComponentBase, FeedFormMode } from '../../feed-details.component';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vRokuDestinationForm',
  templateUrl: './roku-destination-form.component.html',
  styleUrls: ['./roku-destination-form.component.scss'],
  providers: [{provide: DestinationComponentBase, useExisting: RokuDestinationFormComponent}]
})
export class RokuDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {
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

  public getData(): VidiunRokuSyndicationFeed {
    return new VidiunRokuSyndicationFeed();
  }
}

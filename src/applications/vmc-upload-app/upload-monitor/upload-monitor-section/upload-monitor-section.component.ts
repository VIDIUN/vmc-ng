import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { VmcMainViewBaseService } from 'app-shared/vmc-shared/vmc-views/vmc-main-view-base.service';

@Component({
  selector: 'vUploadMonitorSection',
  templateUrl: './upload-monitor-section.component.html',
  styleUrls: ['./upload-monitor-section.component.scss'],
})
export class UploadMonitorSectionComponent {
  @Input() title: string;
  @Input() detailsViewService: VmcMainViewBaseService;
  @Input() type: 'dropFolder' | 'other' = 'other';
  @Input() uploading = 0;
  @Input() queued = 0;
  @Input() completed = 0;
  @Input() errors = 0;
  @Input() uploadMonitorPopup: PopupWidgetComponent;
  @Input() layout: 'loading' | 'totals' | 'error' | 'recoverableError' = 'loading';

  @Output() requestToRecover = new EventEmitter<void>();

  public get _isUpToDate(): boolean {
    return (this.uploading + this.queued + this.completed + this.errors) === 0;
  }

  public get _uploadingTitle(): string {
    return this.type === 'dropFolder' ? 'applications.upload.uploadMonitor.syncing' : 'applications.upload.uploadMonitor.uploading';
  }

  public _openDetails(): void {
      if (this.detailsViewService instanceof VmcMainViewBaseService) {
          this.detailsViewService.open();
      }
      this.uploadMonitorPopup.close();
  }
}

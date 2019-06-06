import { AppEvent } from 'app-shared/vmc-shared/app-events/app-event';
import { VidiunBatchJobStatus } from 'vidiun-ngx-client';

export class BulkLogUploadingStartedEvent extends AppEvent {
  constructor(public id: number, public status: VidiunBatchJobStatus, public uploadedOn: Date) {
    super('BulkLogUploadingStarted');
  }
}

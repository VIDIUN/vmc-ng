import { Pipe, PipeTransform } from '@angular/core';
import { VidiunBatchJobStatus } from 'vidiun-ngx-client';

@Pipe({ name: 'vBulkLogTableStatusIcon' })
export class BulkLogStatusIconPipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case VidiunBatchJobStatus.pending:
      case VidiunBatchJobStatus.queued:
      case VidiunBatchJobStatus.dontProcess:
        return 'vIconUpload2 vBulkLogTablePending';

      case VidiunBatchJobStatus.processing:
      case VidiunBatchJobStatus.almostDone:
        return 'vIconSync vBulkLogTableProgress';

      case VidiunBatchJobStatus.finished:
      case VidiunBatchJobStatus.finishedPartially: // waiting for icon
        return 'vIconComplete vBulkLogTableSuccess';

      case VidiunBatchJobStatus.failed:
      case VidiunBatchJobStatus.fatal:
      case VidiunBatchJobStatus.aborted: // waiting for icon
      case VidiunBatchJobStatus.retry: // waiting for icon
        return 'vIconError vBulkLogTableFailed';

      default:
        return '';
    }
  }
}

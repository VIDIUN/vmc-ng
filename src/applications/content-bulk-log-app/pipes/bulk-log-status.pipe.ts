import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunBatchJobStatus } from 'vidiun-ngx-client';

@Pipe({ name: 'vBulkLogTableStatus' })

export class BulkLogStatusPipe implements PipeTransform {

  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: number): string {
    switch (value) {
      case VidiunBatchJobStatus.pending:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.pending');

      case VidiunBatchJobStatus.queued:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.queued');

      case VidiunBatchJobStatus.processing:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.processing');

      case VidiunBatchJobStatus.finished:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.finished');

      case VidiunBatchJobStatus.aborted:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.aborted');

      case VidiunBatchJobStatus.failed:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.failed');

      case VidiunBatchJobStatus.almostDone:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.almostDone');

      case VidiunBatchJobStatus.fatal:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.fatal');

      case VidiunBatchJobStatus.retry:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.retry');

      case VidiunBatchJobStatus.dontProcess:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.dontProcess');

      case VidiunBatchJobStatus.finishedPartially:
        return this._appLocalization.get('applications.content.bulkUpload.bulkStatus.finishedPartially');

      default:
        return '';
    }
  }
}

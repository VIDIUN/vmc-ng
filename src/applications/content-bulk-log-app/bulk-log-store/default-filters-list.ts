import { VidiunBulkUploadObjectType } from 'vidiun-ngx-client';
import { VidiunBatchJobStatus } from 'vidiun-ngx-client';

export const DefaultFiltersList: {
  name: string;
  label: string;
  items: { value: string, label: string }[]
}[] = [
  {
    name: 'uploadedItem',
    label: 'uploadedItems',
    items: [
      { value: VidiunBulkUploadObjectType.entry, label: 'entries' },
      { value: VidiunBulkUploadObjectType.category, label: 'categories' },
      { value: VidiunBulkUploadObjectType.categoryUser, label: 'endUserEntitlements' },
      { value: VidiunBulkUploadObjectType.user, label: 'endUsers' }
    ]
  },
  {
    name: 'status',
    label: 'statuses',
    items: [
      { value: `${VidiunBatchJobStatus.finished}`, label: 'successFinish' },
      { value: `${VidiunBatchJobStatus.finishedPartially}`, label: 'errorFinish' },
      { value: [VidiunBatchJobStatus.failed, VidiunBatchJobStatus.fatal].join(','), label: 'failed' },
      {
        value: [
          VidiunBatchJobStatus.pending,
          VidiunBatchJobStatus.queued,
          VidiunBatchJobStatus.finished,
          VidiunBatchJobStatus.processed,
          VidiunBatchJobStatus.movefile,
          VidiunBatchJobStatus.aborted,
          VidiunBatchJobStatus.almostDone,
          VidiunBatchJobStatus.retry,
          VidiunBatchJobStatus.dontProcess
        ].join(','),
        label: 'otherStatuses'
      }
    ]
  }
];

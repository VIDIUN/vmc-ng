import { VidiunBulkUploadType } from 'vidiun-ngx-client';

export function getBulkUploadType(type: VidiunBulkUploadType): string {
  switch (true) {
    case VidiunBulkUploadType.csv === type:
      return 'csv';

    case VidiunBulkUploadType.xml === type:
    case VidiunBulkUploadType.dropFolderXml === type:
      return 'xml';

    case VidiunBulkUploadType.ical === type:
    case VidiunBulkUploadType.dropFolderIcal === type:
      return 'ics';

    default:
      return 'txt';
  }
}

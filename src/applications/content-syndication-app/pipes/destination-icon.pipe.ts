import {Pipe, PipeTransform} from '@angular/core';
import {VidiunSyndicationFeedType} from 'vidiun-ngx-client';

@Pipe({name: 'vDestinationIcon'})
export class DestinationIconPipe implements PipeTransform {
  constructor() {
  }

  transform(value: VidiunSyndicationFeedType): string {
    switch (value) {
      case VidiunSyndicationFeedType.googleVideo:
        return 'vIconGoogle';
      case VidiunSyndicationFeedType.yahoo:
        return 'vIconYahoo';
      case VidiunSyndicationFeedType.itunes:
        return 'vIconITunes';
      case VidiunSyndicationFeedType.rokuDirectPublisher:
        return 'vIconRoku';
      case VidiunSyndicationFeedType.operaTvSnap:
        return 'vIconOpera';
      case VidiunSyndicationFeedType.vidiunXslt:
        // handled by DestinationLabelPipe since we need to show text and not icon
        return '';
      default:
        return '';
    }
  }
}

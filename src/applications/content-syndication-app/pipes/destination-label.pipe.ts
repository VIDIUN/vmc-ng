import {Pipe, PipeTransform} from '@angular/core';
import {VidiunSyndicationFeedType} from 'vidiun-ngx-client';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Pipe({name: 'vDestinationLabel'})
export class DestinationLabelPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: VidiunSyndicationFeedType): string {
    if (value === VidiunSyndicationFeedType.vidiunXslt) {
      return this.appLocalization.get('applications.content.syndication.table.flexibleFormatFeed');
    }
    return null;
  }
}

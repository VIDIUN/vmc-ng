import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunEntryStatus } from 'vidiun-ngx-client';
import { VidiunEntryModerationStatus } from 'vidiun-ngx-client';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';

@Pipe({ name: 'entryStatus' })
export class EntryStatusPipe implements PipeTransform {

  constructor(private appLocalization: AppLocalization) {
  }

  transform(entry: VidiunMediaEntry): string {
    let ret = '';
    const isLive = entry.mediaType === VidiunMediaType.liveStreamFlash ||
      entry.mediaType === VidiunMediaType.liveStreamQuicktime ||
      entry.mediaType === VidiunMediaType.liveStreamRealMedia ||
      entry.mediaType === VidiunMediaType.liveStreamWindowsMedia;
    if (typeof(entry) !== 'undefined' && entry !== null) {
      switch (entry.status.toString()) {
        case VidiunEntryStatus.errorImporting.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.errorImporting');
          break;
        case VidiunEntryStatus.errorConverting.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.errorConverting');
          break;
        case VidiunEntryStatus.scanFailure.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.scanFailure');
          break;
        case VidiunEntryStatus.import.toString():
          if (isLive) {
            ret = this.appLocalization.get('applications.content.entryStatus.provisioning');
          } else {
            ret = this.appLocalization.get('applications.content.entryStatus.import');
          }
          break;
        case VidiunEntryStatus.infected.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.infected');
          break;
        case VidiunEntryStatus.preconvert.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.preconvert');
          break;
        case VidiunEntryStatus.ready.toString():
          ret = this.getReadyState(entry);
          break;
        case VidiunEntryStatus.deleted.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.deleted');
          break;
        case VidiunEntryStatus.pending.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.pending');
          break;
        case VidiunEntryStatus.moderate.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.moderate');
          break;
        case VidiunEntryStatus.blocked.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.blocked');
          break;
        case VidiunEntryStatus.noContent.toString():
          ret = this.appLocalization.get('applications.content.entryStatus.noContent');
          break;
      }
    }
    return ret;
  }

  getReadyState(entry: VidiunMediaEntry) {
    const SCHEDULING_ALL_OR_IN_FRAME = 1;
    const SCHEDULING_BEFORE_FRAME = 2;
    const SCHEDULING_AFTER_FRAME = 3;

    let result = '';
    const time = new Date();
    let schedulingType = 0;

    const undefinedDate = (date) => typeof date === 'undefined' || date < 0;

    if (
      (undefinedDate(entry.startDate) && undefinedDate(entry.endDate)) ||
      (entry.startDate <= time && entry.endDate >= time) ||
      (entry.startDate < time && undefinedDate(entry.endDate)) ||
      (undefinedDate(entry.startDate) && entry.endDate > time)
    ) {
      schedulingType = SCHEDULING_ALL_OR_IN_FRAME;
    } else if (entry.startDate > time) {
      schedulingType = SCHEDULING_BEFORE_FRAME;
    } else if (entry.endDate < time) {
      schedulingType = SCHEDULING_AFTER_FRAME;
    }

    const moderationStatus: number = entry.moderationStatus;
    switch (moderationStatus) {
      case VidiunEntryModerationStatus.approved:
      case VidiunEntryModerationStatus.autoApproved:
      case VidiunEntryModerationStatus.flaggedForReview:
        if (schedulingType === SCHEDULING_ALL_OR_IN_FRAME) {
          result = this.appLocalization.get('applications.content.entryStatus.ready');
        } else if (schedulingType === SCHEDULING_BEFORE_FRAME) {
          result = this.appLocalization.get('applications.content.entryStatus.scheduledStatus');
        } else if (schedulingType === SCHEDULING_AFTER_FRAME) {
          result = this.appLocalization.get('applications.content.entryStatus.finishedStatus');
        }
        break;
      case VidiunEntryModerationStatus.pendingModeration:
        result = this.appLocalization.get('applications.content.entryStatus.pendingStatus');
        break;

      case VidiunEntryModerationStatus.rejected:
        result = this.appLocalization.get('applications.content.entryStatus.rejectedStatus');
        break;

    }
    return result;
  }
}

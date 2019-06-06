import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunEntryModerationStatus } from 'vidiun-ngx-client';

@Pipe({name: 'vModerationStatus'})
export class ModerationPipe implements PipeTransform {
	constructor(private appLocalization: AppLocalization) {
	}

	transform(value: string): string {
		let moderationStatus: string = "";
		if (value) {
			switch (value.toString()) {
				case VidiunEntryModerationStatus.autoApproved.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.autoApprovedStatus");
          break;
				case VidiunEntryModerationStatus.flaggedForReview.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.flaggedStatus");
					break;
				case VidiunEntryModerationStatus.approved.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.approvedStatus");
					break;
				case VidiunEntryModerationStatus.pendingModeration.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.pendingStatus");
					break;
				case VidiunEntryModerationStatus.rejected.toString():
					moderationStatus = this.appLocalization.get("applications.content.entryStatus.rejectedStatus");
					break;
			}
		}
		return moderationStatus;
	}
}

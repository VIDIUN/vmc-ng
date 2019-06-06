import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { VidiunMediaEntry } from 'vidiun-ngx-client';

@Pipe({name: 'entryDuration'})
export class EntryDurationPipe implements PipeTransform {
	constructor(private appLocalization: AppLocalization) {
	}

	transform(value: string, entry: VidiunMediaEntry = null): string {
	let duration = value;
	if (entry && entry instanceof VidiunMediaEntry && entry.mediaType){
  		const type = entry.mediaType.toString();
		if (type === VidiunMediaType.liveStreamFlash.toString() ||
				type === VidiunMediaType.liveStreamQuicktime.toString() ||
				type === VidiunMediaType.liveStreamRealMedia.toString() ||
				type === VidiunMediaType.liveStreamWindowsMedia.toString()
		){
			duration = this.appLocalization.get('app.common.n_a');
		}
    }
    return duration;
  }
}

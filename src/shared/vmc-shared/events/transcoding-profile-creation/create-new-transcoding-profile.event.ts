import { AppEvent } from 'shared/vmc-shared/app-events/app-event';
import { VidiunConversionProfile } from 'vidiun-ngx-client';

export interface CreateNewTranscodingProfileEventArgs {
  profile: VidiunConversionProfile;
}

export class CreateNewTranscodingProfileEvent extends AppEvent {
  constructor(public data: CreateNewTranscodingProfileEventArgs) {
    super('CreateNewTranscodingProfile');
  }
}

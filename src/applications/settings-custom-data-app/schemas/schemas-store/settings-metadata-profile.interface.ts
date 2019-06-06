import { VidiunMetadataProfile } from 'vidiun-ngx-client';
import { MetadataProfile } from 'app-shared/vmc-shared';
import { VidiunMetadataObjectType } from 'vidiun-ngx-client';

export interface SettingsMetadataProfile extends VidiunMetadataProfile {
  profileDisabled: boolean;
  parsedProfile?: MetadataProfile;
  defaultLabel?: string;
  applyTo?: VidiunMetadataObjectType;
  downloadUrl?: string;
  isNew?: boolean;
}

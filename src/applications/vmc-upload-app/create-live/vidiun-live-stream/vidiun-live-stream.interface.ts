import {VidiunRecordStatus} from 'vidiun-ngx-client';

export interface VidiunLive {
  name: string
  description: string,
  transcodingProfile: number,
  liveDVR: boolean,
  enableRecording: boolean,
  enableRecordingSelectedOption: VidiunRecordStatus,
  previewMode: boolean
}

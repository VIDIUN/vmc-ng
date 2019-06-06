import { Injectable } from '@angular/core';
import { VidiunClient } from 'vidiun-ngx-client';

@Injectable()
export class SettingsTranscodingSettingsService {

  constructor(private _vidiunServerClient: VidiunClient) {
  }
}

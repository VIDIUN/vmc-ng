import {Injectable} from '@angular/core';
import {VidiunRecordStatus} from 'vidiun-ngx-client';
import {VidiunLiveStreamEntry} from 'vidiun-ngx-client';
import {VidiunMediaType} from 'vidiun-ngx-client';
import {VidiunDVRStatus} from 'vidiun-ngx-client';
import {VidiunClient} from 'vidiun-ngx-client';
import {LiveStreamAddAction} from 'vidiun-ngx-client';
import {VidiunSourceType} from 'vidiun-ngx-client';
import { Observable } from 'rxjs';
import {VidiunLiveStreamConfiguration} from 'vidiun-ngx-client';
import {VidiunPlaybackProtocol} from 'vidiun-ngx-client';
import {VidiunLive} from './vidiun-live-stream/vidiun-live-stream.interface';
import {ManualLive} from './manual-live/manual-live.interface';
import {UniversalLive} from './universal-live/universal-live.interface';
import { VidiunNullableBoolean } from 'vidiun-ngx-client';

@Injectable()
export class CreateLiveService {

  constructor(private _vidiunServerClient: VidiunClient) {
  }

  public createVidiunLiveStream(data: VidiunLive): Observable<VidiunLiveStreamEntry> {
    if (!data || !data.name) {
      throw Observable.throw(new Error('Missing required fields'));
    }

    const stream = new VidiunLiveStreamEntry({
      mediaType: VidiunMediaType.liveStreamFlash,
      name: data.name,
      description: data.description,
      recordStatus: data.enableRecording ? data.enableRecordingSelectedOption : VidiunRecordStatus.disabled,
      conversionProfileId: data.transcodingProfile,
      dvrStatus: data.liveDVR ? VidiunDVRStatus.enabled : VidiunDVRStatus.disabled,
      dvrWindow: data.liveDVR ? 120 : null,
        explicitLive: data.previewMode ? VidiunNullableBoolean.trueValue : VidiunNullableBoolean.falseValue
    });

    return this._vidiunServerClient
      .request(new LiveStreamAddAction({liveStreamEntry: stream, sourceType: VidiunSourceType.liveStream}))
  }

  public createManualLiveStream(data: ManualLive): Observable<VidiunLiveStreamEntry> {
    if (!data || !data.name) {
      throw Observable.throw(new Error('Missing required fields'));
    }
    const stream = new VidiunLiveStreamEntry({
      mediaType: VidiunMediaType.liveStreamFlash,
      name: data.name,
      description: data.description,
      liveStreamConfigurations: new Array(),
      hlsStreamUrl: data.hlsStreamUrl || ''
    });

    if (data.hlsStreamUrl) {
      const cfg = new VidiunLiveStreamConfiguration();
      cfg.protocol = VidiunPlaybackProtocol.appleHttp;
      cfg.url = stream.hlsStreamUrl;
      stream.liveStreamConfigurations.push(cfg);
    }

    if (data.flashHDSURL) {
      const cfg = new VidiunLiveStreamConfiguration();
      cfg.protocol = data.useAkamaiHdProtocol ? VidiunPlaybackProtocol.akamaiHds : VidiunPlaybackProtocol.hds;
      cfg.url = data.flashHDSURL;
      stream.liveStreamConfigurations.push(cfg);
    }

    return this._vidiunServerClient
      .request(new LiveStreamAddAction({liveStreamEntry: stream, sourceType: VidiunSourceType.manualLiveStream}))
  }

  public createUniversalLiveStream(data: UniversalLive): Observable<VidiunLiveStreamEntry> {
    if (!data || !data.name || !data.primaryEncoderIp || !data.secondaryEncoderIp) {
      throw Observable.throw(new Error('Missing required fields'));
    }

    const stream = new VidiunLiveStreamEntry({
      mediaType: VidiunMediaType.liveStreamFlash,
      name: data.name,
      description: data.description,
      encodingIP1: data.primaryEncoderIp,
      encodingIP2: data.secondaryEncoderIp,
      streamPassword: data.broadcastPassword || '',
      dvrStatus: data.liveDvr ? VidiunDVRStatus.enabled : VidiunDVRStatus.disabled,
      dvrWindow: data.liveDvr ? 30 : null
    });


    return this._vidiunServerClient
      .request(new LiveStreamAddAction({liveStreamEntry: stream, sourceType: VidiunSourceType.akamaiUniversalLive}))
  }
}

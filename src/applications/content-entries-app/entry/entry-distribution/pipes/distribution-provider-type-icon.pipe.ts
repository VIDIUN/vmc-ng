import { Pipe, PipeTransform } from '@angular/core';
import { VidiunDistributionProviderType } from 'vidiun-ngx-client';

@Pipe({ name: 'vEntriesDistributionProviderTypeIcon' })
export class DistributionProviderTypeIconPipe implements PipeTransform {

  transform(providerType: VidiunDistributionProviderType): string {
    let className;

    switch (true) {
      case VidiunDistributionProviderType.comcastMrss === providerType:
        className = 'comcast';
        break;

      case VidiunDistributionProviderType.dailymotion === providerType:
        className = 'dailymotion';
        break;

      case VidiunDistributionProviderType.doubleclick === providerType:
        className = 'doubleclick';
        break;

      case VidiunDistributionProviderType.facebook === providerType:
        className = 'facebook';
        break;

      case VidiunDistributionProviderType.freewheel === providerType:
      case VidiunDistributionProviderType.freewheelGeneric === providerType:
        className = 'freewheel';
        break;

      case VidiunDistributionProviderType.hulu === providerType:
        className = 'hulu';
        break;

      case VidiunDistributionProviderType.crossVidiun === providerType:
        className = 'vidiun';
        break;

      case VidiunDistributionProviderType.quickplay === providerType:
        className = 'quickplay';
        break;

      case VidiunDistributionProviderType.uverse === providerType:
      case VidiunDistributionProviderType.uverseClickToOrder === providerType:
      case VidiunDistributionProviderType.attUverse === providerType:
        className = 'uverse';
        break;

      case VidiunDistributionProviderType.yahoo === providerType:
        className = 'yahoo';
        break;

      case VidiunDistributionProviderType.youtube === providerType:
      case VidiunDistributionProviderType.youtubeApi === providerType:
        className = 'youtube';
        break;

      default:
        className = 'distribution';
        break;
    }

    return className;
  }
}

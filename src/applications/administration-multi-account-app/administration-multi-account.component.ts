import { Component } from '@angular/core';
import { MultiAccountStoreService } from './multi-account-store/multi-account-store.service';
import { VidiunLogger, VidiunLoggerName } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'vMultiAccount',
  templateUrl: './administration-multi-account.component.html',
  styleUrls: ['./administration-multi-account.component.scss'],
  providers: [
      MultiAccountStoreService,
    VidiunLogger.createLogger('AdministrationMultiAccount')
  ]
})

export class AdministrationMultiAccountComponent {
}

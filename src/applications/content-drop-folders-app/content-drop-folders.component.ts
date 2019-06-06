import { Component } from '@angular/core';
import { DropFoldersStoreService } from './drop-folders-store/drop-folders-store.service';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VidiunLoggerName } from '@vidiun-ng/vidiun-logger';


@Component({
  selector: 'vDropFolders',
  templateUrl: './content-drop-folders.component.html',
  styleUrls: ['./content-drop-folders.component.scss'],
  providers: [
    DropFoldersStoreService,
      VidiunLogger,
    {
      provide: VidiunLoggerName, useValue: 'drop-folders-store.service'
    }
  ]
})
export class ContentDropFoldersComponent {
}


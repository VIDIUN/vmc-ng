import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { PlaylistCreationService } from 'shared/vmc-shared/events/playlist-creation/playlist-creation.service';

@NgModule({
  imports: <any[]>[],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class PlaylistCreationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PlaylistCreationModule,
      providers: [PlaylistCreationService]
    };
  }

  constructor(@Optional() @Self() playlistCreationService: PlaylistCreationService) {
    if (playlistCreationService) {
      playlistCreationService.init();
    }
  }
}

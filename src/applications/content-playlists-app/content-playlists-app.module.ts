import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailsBarModule } from '@vidiun-ng/vidiun-ui';

import { routing } from './content-playlists-app.routes';

import { AreaBlockerModule, VidiunUIModule, StickyModule, TooltipModule } from '@vidiun-ng/vidiun-ui';
import {
  ButtonModule, CalendarModule, CheckboxModule, DropdownModule, InputTextModule, MenuModule, PaginatorModule,
  RadioButtonModule, InputTextareaModule, SharedModule, TieredMenuModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import { VidiunPrimeNgUIModule } from '@vidiun-ng/vidiun-primeng-ui';
import { AutoCompleteModule } from '@vidiun-ng/vidiun-primeng-ui';
import { TagsModule } from '@vidiun-ng/vidiun-ui';
import { PopupWidgetModule } from '@vidiun-ng/vidiun-ui';

import { ContentPlaylistsComponent } from './content-playlists.component';
import { PlaylistsComponentsList } from './playlists/playlists-components-list';
import { PlaylistComponentsList } from './playlist/playlist-components-list';
import { PlaylistCanDeactivate } from './playlist/playlist-can-deactivate.service';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';
import { FiltersModule } from '@vidiun-ng/mc-shared';
import { SliderModule } from '@vidiun-ng/vidiun-primeng-ui';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { VPTableModule } from '@vidiun-ng/vidiun-primeng-ui';
import { DateFormatModule } from 'app-shared/vmc-shared/date-format/date-format.module';

@NgModule({
    imports: [
      CommonModule,
      AreaBlockerModule,
      LocalizationModule,
      VidiunUIModule,
      PaginatorModule,
      TooltipModule,
      ButtonModule,
      TieredMenuModule,
      CheckboxModule,
      FormsModule,
      ReactiveFormsModule,
      InputTextModule,
      InputTextareaModule,
      PopupWidgetModule,
      CalendarModule,
      MenuModule,
      RadioButtonModule,
      TagsModule,
      VidiunPrimeNgUIModule,
      AutoCompleteModule,
      SharedModule,
	  DetailsBarModule,
      RouterModule.forChild(routing),
	  StickyModule,
        EntriesModule,
    FiltersModule,
    DropdownModule,
    SliderModule,
      TableModule,
      VMCPermissionsModule,
        VPTableModule,
        DateFormatModule,
  ],declarations: [
      ContentPlaylistsComponent,
      PlaylistsComponentsList,
      PlaylistComponentsList
    ],
    exports: [
    ],
    providers : [
      PlaylistCanDeactivate
    ]
})
export class ContentPlaylistsAppModule {
}

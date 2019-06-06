import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './content-syndication-app.routes';
import {AreaBlockerModule, VidiunUIModule, StickyModule, TooltipModule} from '@vidiun-ng/vidiun-ui';
import {
  CheckboxModule,
  ConfirmDialogModule,
  DropdownModule,
  InputTextModule,
  MenuModule,
  MultiSelectModule,
  PaginatorModule,
  RadioButtonModule,
  SpinnerModule,
  TieredMenuModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import {VMCShellModule} from 'app-shared/vmc-shell';
import {PopupWidgetModule} from '@vidiun-ng/vidiun-ui';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/components/button/button';
import {VidiunPrimeNgUIModule} from '@vidiun-ng/vidiun-primeng-ui';
import {FeedsListComponent} from './feeds/feeds-list/feeds-list.component';
import {FeedsTableComponent} from './feeds/feeds-table/feeds-table.component';
import {ContentSyndicationComponent} from './content-syndication.component';
import {DestinationLabelPipe} from './pipes/destination-label.pipe';
import {PlaylistNamePipe} from './pipes/playlist-name.pipe';
import {PlaylistIconPipe} from './pipes/playlist-icon.pipe';
import {DestinationIconPipe} from './pipes/destination-icon.pipe';
import {FeedDetailsComponentsList} from './feeds/feed-details/feed-details-components-list';
import {CopyToClipboardModule} from '@vidiun-ng/mc-shared';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { InputHelperModule } from '@vidiun-ng/vidiun-ui';
import { SearchableDropdownModule } from 'app-shared/vmc-shared/searchable-dropdown';

@NgModule({
  imports: [
    AreaBlockerModule,
    ButtonModule,
    CheckboxModule,
    CommonModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextModule,
    RadioButtonModule,
    LocalizationModule,
    VidiunPrimeNgUIModule,
    VidiunUIModule,
    VMCShellModule,
    MenuModule,
    PaginatorModule,
    PopupWidgetModule,
    ReactiveFormsModule,
    RouterModule.forChild(routing),
    SpinnerModule,
    TieredMenuModule,
    TooltipModule,
    MultiSelectModule,
    StickyModule,
    FormsModule,
    CopyToClipboardModule,
    TableModule,
    VMCPermissionsModule,
    InputHelperModule,
      SearchableDropdownModule,
  ],
  declarations: [
    DestinationIconPipe,
    DestinationLabelPipe,
    ContentSyndicationComponent,
    PlaylistNamePipe,
    PlaylistIconPipe,
    FeedsListComponent,
    FeedsTableComponent,
    FeedDetailsComponentsList]
})
export class ContentSyndicationAppModule {
}

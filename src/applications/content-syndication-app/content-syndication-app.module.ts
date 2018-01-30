import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './content-syndication-app.routes';
import {AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {
  CheckboxModule,
  ConfirmDialogModule,
  DataTableModule,
  DropdownModule,
  InputTextModule,
  MenuModule,
  MultiSelectModule,
  PaginatorModule,
  RadioButtonModule,
  SpinnerModule,
  TieredMenuModule
} from 'primeng/primeng';
import {KalturaCommonModule} from '@kaltura-ng/kaltura-common';
import {KMCShellModule} from 'app-shared/kmc-shell';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui/popup-widget';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/components/button/button';
import {KalturaPrimeNgUIModule} from '@kaltura-ng/kaltura-primeng-ui';
import {FeedsListComponent} from './feeds/feeds-list/feeds-list.component';
import {FeedsTableComponent} from './feeds/feeds-table/feeds-table.component';
import {ContentSyndicationComponent} from './content-syndication.component';
import {PrimeTableSortDirectionPipe} from './pipes/prime-table-sort-direction.pipe';
import {DestinationLabelPipe} from './pipes/destination-label.pipe';
import {PlaylistNamePipe} from './pipes/playlist-name.pipe';
import {PlaylistIconPipe} from './pipes/playlist-icon.pipe';
import {CopyToClipboardComponent} from './copy-to-clipboard/copy-to-clipboard.component';
import {DestinationIconPipe} from './pipes/destination-icon.pipe';
import {FeedDetailsComponentsList} from './feeds/feed-details/feed-details-components-list';

@NgModule({
  imports: [
    AreaBlockerModule,
    ButtonModule,
    CheckboxModule,
    CommonModule,
    ConfirmDialogModule,
    DataTableModule,
    DropdownModule,
    InputTextModule,
    RadioButtonModule,
    KalturaCommonModule,
    KalturaPrimeNgUIModule,
    KalturaUIModule,
    KMCShellModule,
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
    FormsModule
  ],
  declarations: [
    PrimeTableSortDirectionPipe,
    DestinationIconPipe,
    DestinationLabelPipe,
    ContentSyndicationComponent,
    PlaylistNamePipe,
    PlaylistIconPipe,
    FeedsListComponent,
    CopyToClipboardComponent,
    FeedsTableComponent,
    FeedDetailsComponentsList]
})
export class ContentSyndicationAppModule {
}

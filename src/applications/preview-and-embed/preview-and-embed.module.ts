import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, DropdownModule, InputTextareaModule, InputSwitchModule, RadioButtonModule } from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui/area-blocker';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { PreviewEmbedComponent } from './preview-and-embed.component';
import { PreviewEmbedDetailsComponent } from './preview-embed.component';
import { QRCodeModule } from 'angularx-qrcode';


@NgModule({
  imports: [
    CommonModule,
    PopupWidgetModule,
    AreaBlockerModule,
    FormsModule,
    ReactiveFormsModule,
    KalturaCommonModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    InputSwitchModule,
    RadioButtonModule,
      QRCodeModule
  ],
  declarations: [
    PreviewEmbedComponent,
    PreviewEmbedDetailsComponent
  ],
  providers: [
  ],
  exports: [
    PreviewEmbedComponent
  ]
})
export class PreviewAndEmbedModule {
}

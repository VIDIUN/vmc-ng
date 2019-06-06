import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {NgxWebstorageModule} from 'ngx-webstorage';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {VidiunLogger, VidiunLoggerName} from '@vidiun-ng/vidiun-logger';
import {PreviewAndEmbedModule} from '../applications/preview-and-embed/preview-and-embed.module';
import {EntriesModule} from 'app-shared/content-shared/entries/entries.module';
import {CategoriesModule} from 'app-shared/content-shared/categories/categories.module';
import {CategoriesStatusModule} from 'app-shared/content-shared/categories-status/categories-status.module';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { LocalizationModule } from '@vidiun-ng/mc-shared';
import { VidiunLoggerInjectionToken } from '@vidiun-ng/vidiun-common';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './i18n/', '.json');
}

import {
    AppBootstrap,
    AuthModule,
    BrowserService,
    VMCShellModule,
    NewEntryUploadModule
} from 'app-shared/vmc-shell';
import {
  AppStorage,
    VidiunCommonModule,
  OperationTagModule,
  UploadManagement
} from '@vidiun-ng/vidiun-common';
import {AreaBlockerModule, StickyModule, TooltipModule} from '@vidiun-ng/vidiun-ui';
import {VidiunClientModule, VidiunClientOptions} from 'vidiun-ngx-client';
import {PopupWidgetModule} from '@vidiun-ng/vidiun-ui';
import {
  AccessControlProfileStore,
  AppEventsModule,
  FlavoursStore,
  VidiunServerModule,
  MetadataProfileModule, PartnerProfileStore,
} from 'app-shared/vmc-shared';

import {AppComponent} from './app.component';
import {routing} from './app.routes';

import {DashboardComponent} from './components/dashboard/dashboard.component';
import {AppMenuComponent} from './components/app-menu/app-menu.component';
import {ErrorComponent} from './components/error/error.component';
import {UserSettingsComponent} from './components/user-settings/user-settings.component';

import {
  ButtonModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule,
  DropdownModule,
  GrowlModule,
  InputTextModule,
  RadioButtonModule,
  TieredMenuModule
} from 'primeng/primeng';


import { UploadManagementModule } from '@vidiun-ng/vidiun-common';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordFormComponent } from './components/login/forgot-password-form/forgot-password-form.component';
import { LoginFormComponent } from './components/login/login-form/login-form.component';
import { PasswordExpiredFormComponent } from './components/login/password-expired-form/password-expired-form.component';
import { InvalidLoginHashFormComponent } from './components/login/invalid-login-hash-form/invalid-login-hash-form.component';
import { AppMenuContentComponent } from './components/app-menu/app-menu-content.component';
import { VmcUploadAppModule } from '../applications/vmc-upload-app/vmc-upload-app.module';
import { TranscodingProfileManagementModule } from 'app-shared/vmc-shared/transcoding-profile-management';
import { ChangeAccountComponent } from './components/changeAccount/change-account.component';
import { OpenEmailComponent } from './components/open-email/open-email.component';
import { BulkUploadModule } from 'app-shared/vmc-shell/bulk-upload';
import { ChangelogComponent } from './components/changelog/changelog.component';
import { ChangelogContentComponent } from './components/changelog/changelog-content/changelog-content.component';
import { PlaylistCreationModule } from 'app-shared/vmc-shared/events/playlist-creation';
import { VMCServerPollsModule } from 'app-shared/vmc-shared/server-polls';
import { ViewCategoryEntriesModule } from 'app-shared/vmc-shared/events/view-category-entries/view-category-entries.module';
import { AccessControlProfileModule } from 'app-shared/vmc-shared/access-control/access-control-profile.module';
import {PlayersStore} from "app-shared/vmc-shared/players";
import { globalConfig } from 'config/global';
import { getVidiunServerUri } from 'config/server';
import { StorageProfilesStore } from 'app-shared/vmc-shared/storage-profiles';
import { TranscodingProfileCreationModule } from 'app-shared/vmc-shared/events/transcoding-profile-creation/transcoding-profile-creation.module';
import { APP_STORAGE_TOKEN } from '@vidiun-ng/vidiun-common';
import { VmcLogsModule } from 'app-shared/vmc-shell/vmc-logs/vmc-logs.module';
import { VidiunLoggerModule } from '@vidiun-ng/vidiun-logger';
import { VmcViewsModule } from 'app-shared/vmc-shared/vmc-views/vmc-views.module';
import { AppDefaultViewComponent } from './components/app-default-view/app-default-view.component';
import { LoginByVSComponent } from './components/app-actions/login-by-vs.component';
import { NewReplaceVideoUploadModule } from 'app-shared/vmc-shell/new-replace-video-upload/new-replace-video-upload.module';
import { RestorePasswordComponent } from './components/app-actions/restore-password.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { RestorePasswordFormComponent } from './components/login/restore-password-form/restore-password-form.component';
import { InvalidRestorePasswordHashFormComponent } from './components/login/invalid-restore-password-hash-form/invalid-restore-password-hash-form.component';

import { CopyToClipboardModule } from '@vidiun-ng/mc-shared';
import { ContextualHelpModule } from 'app-shared/vmc-shared/contextual-help/contextual-help.module';
import { PersistLoginByVsComponent } from './components/app-actions/persist-login-by-vs.component';
import { ColumnsResizeManagerModule } from 'app-shared/vmc-shared/columns-resize-manager';
import { CaptionRequestAppModule } from '../applications/caption-request-app/caption-request-app.module';
import { NewEntryCreateFromUrlModule } from 'app-shared/vmc-shell/new-entry-create-from-url/new-entry-create-from-url.module';

const partnerProviders: PartnerProfileStore[] = [AccessControlProfileStore, FlavoursStore, PlayersStore, StorageProfilesStore];

export function vidiunClientOptionsFactory(): VidiunClientOptions {

    return  {
        endpointUrl: getVidiunServerUri(),
        clientTag: 'vmcng'
    };
}

@NgModule({
  imports: <any>[
    AuthModule.forRoot(),
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    DropdownModule,
    HttpClientModule,
    InputTextModule,
    MetadataProfileModule.forRoot(),
    NgxPageScrollModule,
    AppEventsModule.forRoot(),
    VMCShellModule.forRoot(),
    VidiunCommonModule.forRoot(),
  TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
  }),
      EntriesModule.forRoot(),
      CategoriesModule.forRoot(),
      NgxWebstorageModule.forRoot(),
    PopupWidgetModule,
    routing,
    PreviewAndEmbedModule,
    TieredMenuModule,
    UploadManagementModule,
    VidiunServerModule,
    AreaBlockerModule,
    CheckboxModule,
    ReactiveFormsModule,
    TooltipModule,
    GrowlModule,
    CopyToClipboardModule,
    VmcUploadAppModule.forRoot(),
    NewEntryUploadModule.forRoot(),
      NewReplaceVideoUploadModule.forRoot(),
    BulkUploadModule.forRoot(),
    TranscodingProfileManagementModule.forRoot(),
    RadioButtonModule,
    StickyModule.forRoot(),
    OperationTagModule.forRoot(),
    PlaylistCreationModule.forRoot(),
    VMCServerPollsModule.forRoot(),
    CategoriesStatusModule.forRoot(),
    ViewCategoryEntriesModule.forRoot(),
    AccessControlProfileModule.forRoot(),
    VMCPermissionsModule.forRoot(),
    TranscodingProfileCreationModule.forRoot(),
    VidiunClientModule.forRoot(vidiunClientOptionsFactory),
      VmcLogsModule.forRoot(),
      VidiunLoggerModule.forRoot('vmc'),
      ContextualHelpModule.forRoot(),
      VmcViewsModule.forRoot(),
      LocalizationModule.forRoot(),
      NewEntryCreateFromUrlModule.forRoot(),
      CaptionRequestAppModule,
      ColumnsResizeManagerModule.forRoot()
  ],
  declarations: <any>[
    AppComponent,
      AppDefaultViewComponent,
    DashboardComponent,
    AppMenuComponent,
    AppMenuContentComponent,
    LoginComponent,
    ErrorComponent,
    UserSettingsComponent,
    LoginFormComponent,
    PasswordExpiredFormComponent,
    ForgotPasswordFormComponent,
    InvalidLoginHashFormComponent,
    ChangeAccountComponent,
    OpenEmailComponent,
    ChangelogComponent,
    ChangelogContentComponent,
    LoginByVSComponent,
      RestorePasswordComponent,
      NotFoundPageComponent,
      RestorePasswordFormComponent,
      InvalidRestorePasswordHashFormComponent,
      ProgressBarComponent,
      PersistLoginByVsComponent,
  ],
  bootstrap: <any>[
    AppComponent
  ],
  exports: [],
  providers: <any>[
      ...partnerProviders,
      {
           provide: APP_STORAGE_TOKEN, useExisting: BrowserService },
    ConfirmationService,
      { provide: VidiunLoggerInjectionToken, useClass: VidiunLogger }
  ]
})
export class AppModule {
    constructor(vidiunLogger: VidiunLogger,
                uploadManagement: UploadManagement) {
        if (globalConfig.client.production) {
            vidiunLogger.setOptions({level: 'Error'});
        } else {
            vidiunLogger.setOptions({level: 'All'});
        }

        // TODO [vmcng] move to a relevant location
        uploadManagement.setMaxUploadRequests(globalConfig.vidiunServer.maxConcurrentUploads);
    }
}

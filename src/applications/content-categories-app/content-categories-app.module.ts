import {
  CategoriesBulkAddTagsService,
  CategoriesBulkChangeCategoryListingService,
  CategoriesBulkChangeContentPrivacyService,
  CategoriesBulkChangeContributionPolicyService,
  CategoriesBulkChangeOwnerService,
  CategoriesBulkDeleteService,
  CategoriesBulkRemoveTagsService
} from './categories/bulk-actions/services';
import {CategoriesBulkActionsComponent} from './categories/bulk-actions/categories-bulk-actions.component';
import {CategoriesModule} from 'app-shared/content-shared/categories/categories.module';

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TagsModule} from '@vidiun-ng/vidiun-ui';
import {
  AccordionModule,
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  ConfirmDialogModule,
  DropdownModule,
  InputSwitchModule,
  InputTextareaModule,
  InputTextModule,
  MenuModule,
  MultiSelectModule,
  PaginatorModule,
  RadioButtonModule,
  SharedModule,
  SpinnerModule,
  TieredMenuModule,
  TreeModule,
} from 'primeng/primeng';
import {TableModule} from 'primeng/table';
import {VMCShellModule} from 'app-shared/vmc-shell';

import {routing} from './content-categories-app.routes';
import {ContentCategoriesComponent} from './content-categories.component';

import {DynamicMetadataFormModule} from 'app-shared/vmc-shared';

import {LocalizationModule} from '@vidiun-ng/mc-shared';

import {VidiunPrimeNgUIModule} from '@vidiun-ng/vidiun-primeng-ui';
import {
  AreaBlockerModule,
  InputHelperModule,
  VidiunUIModule,
  StickyModule,
  TooltipModule
} from '@vidiun-ng/vidiun-ui';
import {AutoCompleteModule} from '@vidiun-ng/vidiun-primeng-ui';
import {PopupWidgetModule} from '@vidiun-ng/vidiun-ui';
import {DynamicFormModule} from '@vidiun-ng/vidiun-ui';
import {DynamicFormModule as PrimeDynamicFormModule} from '@vidiun-ng/vidiun-primeng-ui';
import {CategoryComponentsList} from './category/category-components-list';
import {CategoriesComponentsList} from './categories/categories-components-list';
import {CategoryCanDeactivate} from './category/category-can-deactivate.service';
import {DetailsBarModule} from '@vidiun-ng/vidiun-ui';
import {CategoriesUtilsService} from './categories-utils.service';
import {NewCategoryComponent} from './categories/new-category/new-category.component';
import {MoveCategoryComponent} from './categories/move-category/move-category.component';
import {CategoriesRefineFiltersService} from './categories/categories-refine-filters.service';
import { FiltersModule } from '@vidiun-ng/mc-shared';
import { VMCPermissionsModule } from 'app-shared/vmc-shared/vmc-permissions';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';
import { DateFormatModule } from 'app-shared/vmc-shared/date-format/date-format.module';

@NgModule({
    imports: [
        FiltersModule,
        AccordionModule,
        AreaBlockerModule,
        AutoCompleteModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        CommonModule,
        ConfirmDialogModule,
        CategoriesModule,
        DropdownModule,
        DynamicFormModule,
        FormsModule,
        InputTextareaModule,
        InputTextModule,
        LocalizationModule,
        DynamicMetadataFormModule,
        VidiunPrimeNgUIModule,
        VidiunUIModule,
        VMCShellModule,
        MenuModule,
        MultiSelectModule,
        PaginatorModule,
        PopupWidgetModule,
        PrimeDynamicFormModule,
        RadioButtonModule,
        ReactiveFormsModule,
        RouterModule.forChild(routing),
        SharedModule,
        SpinnerModule,
        TagsModule,
        TieredMenuModule,
        TooltipModule,
        TreeModule,
        DetailsBarModule,
        StickyModule,
        InputHelperModule,
        InputSwitchModule,
        TableModule,
        VMCPermissionsModule,
	    EntriesModule,
        DateFormatModule,
    ],
    declarations: [
        ContentCategoriesComponent,
        CategoryComponentsList,
        CategoriesComponentsList,
        CategoriesBulkActionsComponent,
        MoveCategoryComponent,
        NewCategoryComponent
    ],
    exports: [],
    providers: [CategoryCanDeactivate,
        CategoriesBulkAddTagsService,
        CategoriesBulkRemoveTagsService,
        CategoriesBulkChangeOwnerService,
        CategoriesBulkDeleteService,
        CategoriesBulkChangeContentPrivacyService,
        CategoriesBulkChangeContributionPolicyService,
        CategoriesBulkChangeCategoryListingService,
        CategoriesUtilsService]
})
export class ContentCategoriesAppModule {
}

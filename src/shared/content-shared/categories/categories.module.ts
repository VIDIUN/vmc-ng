import { ModuleWithProviders, NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {AreaBlockerModule, VidiunUIModule, StickyModule, TooltipModule} from '@vidiun-ng/vidiun-ui';

import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  InputTextModule,
  MenuModule,
  PaginatorModule,
  RadioButtonModule, TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LocalizationModule} from '@vidiun-ng/mc-shared';
import {AutoCompleteModule, VidiunPrimeNgUIModule} from '@vidiun-ng/vidiun-primeng-ui';
import {PopupWidgetModule} from '@vidiun-ng/vidiun-ui';

import { CategoriesTreeComponent } from './categories-tree/categories-tree.component';
import { CategoriesFilterPrefsComponent } from './categories-filter-preferences/categories-filter-preferences.component';
import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { TagsModule } from '@vidiun-ng/vidiun-ui';
import { FiltersModule } from '@vidiun-ng/mc-shared';
import { CategoriesTreePropagationDirective } from './categories-tree/categories-tree-propagation.directive';
import { CategoriesSearchService } from './categories-search.service';
import { CategorySelectorComponent } from './category-selector/category-selector.component';
import { CategoryTooltipPipe } from 'app-shared/content-shared/categories/category-tooltip.pipe';

@NgModule({
  imports: [
    AreaBlockerModule,
    TooltipModule,
    AutoCompleteModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeModule,
    LocalizationModule,
    VidiunPrimeNgUIModule,
    VidiunUIModule,
    ButtonModule,
    CalendarModule,
    RadioButtonModule,
    CheckboxModule,
    PopupWidgetModule,
    MenuModule,
    TagsModule,
    PaginatorModule,
    TieredMenuModule,
    InputTextModule,
    StickyModule,
    FiltersModule
  ],
  declarations: [
      CategorySelectorComponent,
    CategoriesTreeComponent,
    CategoriesFilterPrefsComponent,
    CategoriesFilterComponent,
      CategoryTooltipPipe,
    CategoriesTreePropagationDirective
  ],
  exports: [
      CategorySelectorComponent,
    CategoriesTreeComponent,
    CategoriesFilterPrefsComponent,
    CategoriesFilterComponent,
      CategoryTooltipPipe
  ]
})
export class CategoriesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CategoriesModule,
            providers: <any[]>[
                CategoriesSearchService // singleton by design: this service sync inner state when needed thus can be shareable/provided by the module
            ]
        };
    }
}

import {Component, EventEmitter, Input, Output} from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import {VidiunCategory} from 'vidiun-ngx-client';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vSubcategoriesListBulkOperationsContent',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class BulkOperationsComponent {
  @Input() selectedItems: VidiunCategory[] = [];
  @Input() itemsTotalCount = 0;

  @Output() addItem = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() deleteItems = new EventEmitter<VidiunCategory[]>();
  @Output() moveItems = new EventEmitter<{ items: VidiunCategory[], direction: 'up' | 'down' }>();

  public _vmcPermissions = VMCPermissions;

  constructor(private _appLocalization: AppLocalization) {
  }

  public _moveItems(direction: 'up' | 'down'): void {
    this.moveItems.emit({ items: this.selectedItems, direction });
  }

  public _deleteItems(): void {
    this.deleteItems.emit(this.selectedItems);
    this.clearSelection.emit();
  }

  public _getTranslation(key: string, params: string): string {
    return this._appLocalization.get(key, { 0: params });
  }
}


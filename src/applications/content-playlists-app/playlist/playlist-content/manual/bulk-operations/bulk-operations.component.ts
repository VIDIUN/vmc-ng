import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VidiunMediaEntry } from 'vidiun-ngx-client';
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vPlaylistEntryListBulkOperationsContent',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class BulkOperationsComponent {
  @Input() selectedEntries: VidiunMediaEntry[] = [];
  @Input() entriesTotalCount = 0;
  @Input() duration = 0;
  @Input() isNewPlaylist: boolean;

  @Output() addEntry = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() deleteEntries = new EventEmitter<VidiunMediaEntry[]>();
  @Output() moveEntries = new EventEmitter<{ entries: VidiunMediaEntry[], direction: 'up' | 'down' }>();

  public _vmcPermissions = VMCPermissions;

  constructor() {
  }

  public _moveEntries(direction: 'up' | 'down'): void {
    this.moveEntries.emit({ entries: this.selectedEntries, direction });
  }

}


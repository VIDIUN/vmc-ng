import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunFlavorParams } from 'vidiun-ngx-client';
import { VMCPermissions, VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';

@Component({
  selector: 'vTranscodingProfileFalvorsTable',
  templateUrl: './transcoding-profile-flavors-table.component.html',
  styleUrls: ['./transcoding-profile-flavors-table.component.scss']
})
export class TranscodingProfileFlavorsTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() isNewProfile: boolean;
  @Input() selectedFlavors: VidiunFlavorParams[] = [];

  @Input()
  set flavors(data: any[]) {
    if (!this._deferredLoading) {
      this._flavors = [];
      this._cdRef.detectChanges();
      this._flavors = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredFlavors = data;
    }
  }

  @Output() selectedFlavorsChange = new EventEmitter<VidiunFlavorParams[]>();
  @Output() editFlavor = new EventEmitter<VidiunFlavorParams>();

  private _deferredFlavors: VidiunFlavorParams[];
  public _flavors: VidiunFlavorParams[] = [];
  public _emptyMessage: string;
  public _deferredLoading = true;

  public get _isEditAllowed(): boolean {
    return this.isNewProfile || this._permissionsService.hasPermission(VMCPermissions.TRANSCODING_UPDATE);
  }

  constructor(private _appLocalization: AppLocalization,
              private _permissionsService: VMCPermissionsService,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.assignEmptyMessage();
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this._deferredLoading = false;
        this._flavors = this._deferredFlavors;
        this._deferredFlavors = null;
      }, 0);
    }
  }

  ngOnDestroy() {
  }

  public _onSelectionChange(event: VidiunFlavorParams[]): void {
    this.selectedFlavorsChange.emit(event);
  }

  public assignEmptyMessage(): void {
    this._emptyMessage = this._appLocalization.get('applications.content.playlistDetails.errors.addAtLeastOneMedia');
  }

  public _editFlavor(flavor: VidiunFlavorParams): void {
    const isSelected = this.selectedFlavors.indexOf(flavor) !== -1;
    if (isSelected && this._isEditAllowed) {
      this.editFlavor.emit(flavor);
    }
  }
}


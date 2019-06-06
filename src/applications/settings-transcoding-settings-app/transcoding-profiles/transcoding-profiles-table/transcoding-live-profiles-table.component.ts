import { AfterViewInit, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/vmc-shared/columns-resize-manager';
import { TranscodingProfilesTableComponent } from './transcoding-profiles-table.component';
import { VMCPermissionsService } from 'app-shared/vmc-shared/vmc-permissions';
import { AppLocalization } from '@vidiun-ng/mc-shared';

@Component({
    selector: 'v-transcoding-live-profiles-table',
    templateUrl: './transcoding-profiles-table.component.html',
    styleUrls: ['./transcoding-profiles-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'transcodinglive-table' }
    ]
})
export class TranscodingLiveProfilesTableComponent extends TranscodingProfilesTableComponent implements AfterViewInit {
    constructor(protected _appLocalization: AppLocalization,
                protected _permissionsService: VMCPermissionsService,
                protected _cdRef: ChangeDetectorRef,
                private _columnsResizeManager: ColumnsResizeManagerService,
                private _el: ElementRef<HTMLElement>) {
        super(_appLocalization, _permissionsService, _cdRef);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        this._columnsResizeManager.updateColumns(this._el.nativeElement);
    }

    public _onColumnResize(event: { delta: number, element: HTMLTableHeaderCellElement }) {
        this._columnsResizeManager.onColumnResize(event);
    }
}

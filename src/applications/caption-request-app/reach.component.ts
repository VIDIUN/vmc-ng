import { Component, Input, OnInit } from '@angular/core';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { ReachData } from 'app-shared/vmc-shared/reach-frame';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { ReachPages } from 'app-shared/vmc-shared/vmc-views/details-views';

@Component({
    selector: 'vReach',
    templateUrl: './reach.component.html',
    styleUrls: ['./reach.component.scss']
})
export class ReachComponent implements OnInit {
    @Input() page: ReachPages;
    @Input() data: ReachData;
    @Input() parentPopup: PopupWidgetComponent;

    public _title;

    constructor(private _appLocalization: AppLocalization) {

    }

    ngOnInit() {
        if (this.page === ReachPages.category) {
            this._title = this._appLocalization.get('applications.reach.addServiceRule');
        } else {
            this._title = this._appLocalization.get('applications.reach.captionRequests');
        }
    }
}

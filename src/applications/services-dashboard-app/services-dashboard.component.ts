import { Component, OnInit } from '@angular/core';
import { ServicesDashboardMainViewService } from 'app-shared/vmc-shared/vmc-views';
import { ReachPages } from 'app-shared/vmc-shared/vmc-views/details-views';

@Component({
    selector: 'vServicesDashboard',
    templateUrl: './services-dashboard.component.html',
    styleUrls: ['./services-dashboard.component.scss']
})
export class ServicesDashboardComponent implements OnInit {
    public _page = ReachPages.dashboard;
    public _loadFrame = false;

    constructor(private _servicesDashboardMainView: ServicesDashboardMainViewService) {
    }

    ngOnInit() {
        if (this._servicesDashboardMainView.viewEntered()) {
            this._loadFrame = true;
        }
    }
}

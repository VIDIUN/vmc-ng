import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { VMCAppMenuItem } from 'app-shared/vmc-shared/vmc-views';
import { Router, NavigationEnd } from '@angular/router';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
  selector: 'vVMCAppContentMenu',
  templateUrl: './app-menu-content.component.html',
  styleUrls: ['./app-menu-content.component.scss']
})
export class AppMenuContentComponent implements OnChanges, OnDestroy {

    public _items: Array<VMCAppMenuItem>;
    private _selectedMenuItem: VMCAppMenuItem;

    @Input()
    menuItems: VMCAppMenuItem[];

    @Input()
    position: 'right' | 'left';

    constructor(
                private router: Router
                ) {

        router.events
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setSelectedRoute(event.urlAfterRedirects);
            }
        });
    }

    setSelectedRoute(path) {
        if (this._items) {
            this._selectedMenuItem = this._items.find(item => item.isActiveView(path));
        }else {
            this._selectedMenuItem = null;
        }
    }

    ngOnChanges() {
        this._items = (this.menuItems || []).filter(item => (item.position || 'left') === this.position);

        if (this.router.navigated)
        {
            this.setSelectedRoute(this.router.routerState.snapshot.url);
        }
    }

    ngOnDestroy() {

    }
}

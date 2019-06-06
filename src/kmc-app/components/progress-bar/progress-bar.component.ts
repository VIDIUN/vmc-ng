import { Component, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import {NavigationCancel, NavigationError, RouteConfigLoadEnd, RouteConfigLoadStart, Router} from "@angular/router";
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';

@Component({
    selector: 'vLazyModuleLoadingProgressBar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnDestroy {
    private _timeout: any;
    @ViewChild('bar') _bar: ElementRef;

    constructor(router: Router, renderer: Renderer2) {
        router.events
            .pipe(cancelOnDestroy(this))
            .subscribe(event => {
                if (event instanceof RouteConfigLoadStart) {
                    renderer.addClass(this._bar.nativeElement, 'vProgressStep1');
                }

                if (event instanceof RouteConfigLoadEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
                    renderer.removeClass(this._bar.nativeElement, 'vProgressStep1');
                    renderer.addClass(this._bar.nativeElement, 'vProgressStep2');

                    this._timeout = setTimeout(() => {
                        renderer.removeClass(this._bar.nativeElement, 'vProgressStep2');
                    }, 2000);
                }
            });
    }

    ngOnDestroy() {
        clearTimeout(this._timeout);
    }
}


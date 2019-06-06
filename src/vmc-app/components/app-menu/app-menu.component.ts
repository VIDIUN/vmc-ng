import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppAuthentication, AppUser} from 'app-shared/vmc-shell';
import { BrowserService } from 'app-shared/vmc-shell';
import { serverConfig, buildBaseUri } from 'config/server';
import { PopupWidgetComponent } from '@vidiun-ng/vidiun-ui';
import { VmcLoggerConfigurator } from 'app-shared/vmc-shell/vmc-logs/vmc-logger-configurator';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VMCAppMenuItem, VmcMainViewsService } from 'app-shared/vmc-shared/vmc-views';
import { ContextualHelpLink, ContextualHelpService } from 'app-shared/vmc-shared/contextual-help/contextual-help.service';
import { globalConfig } from 'config/global';
import { cancelOnDestroy, tag } from '@vidiun-ng/vidiun-common';
import { AppEventsService } from 'app-shared/vmc-shared';
import { UpdateMenuEvent, ResetMenuEvent } from 'app-shared/vmc-shared/events';

@Component({
    selector: 'vVMCAppMenu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss'],
    providers: [
        VidiunLogger.createLogger('AppMenuComponent')
    ]

})
export class AppMenuComponent implements OnInit, OnDestroy{

    @ViewChild('helpmenu') private _helpmenu: PopupWidgetComponent;
    @ViewChild('supportPopup') private _supportPopup: PopupWidgetComponent;
    @ViewChild('leftMenu') private leftMenu: ElementRef;
    private _appCachedVersionToken = 'vmc-cached-app-version';

    public _showChangelog = false;
    public _helpMenuOpened = false;
    public _powerUser = false;
    public _userManualLinkExists = !!serverConfig.externalLinks.vidiun && !!serverConfig.externalLinks.vidiun.userManual;
    public _vmcOverviewLinkExists = !!serverConfig.externalLinks.vidiun && !!serverConfig.externalLinks.vidiun.vmcOverview;
    public _mediaManagementLinkExists = !!serverConfig.externalLinks.vidiun && !!serverConfig.externalLinks.vidiun.mediaManagement;
    public _supportLinkExists = !!serverConfig.externalLinks.vidiun && !!serverConfig.externalLinks.vidiun.customerCare && !!serverConfig.externalLinks.vidiun.customerPortal;
    public _supportLegacyExists = true;
    public _contextualHelp: ContextualHelpLink[] = [];
    public menuID = 'vmc'; // used when switching menus to Analytics menu or future application menus

    menuConfig: VMCAppMenuItem[];
    leftMenuConfig: VMCAppMenuItem[];
    rightMenuConfig: VMCAppMenuItem[];
    selectedMenuItem: VMCAppMenuItem;
    showSubMenu = true;

    public _customerCareLink = this._supportLinkExists ? serverConfig.externalLinks.vidiun.customerCare : "";
    public _customerPortalLink = this._supportLinkExists ? serverConfig.externalLinks.vidiun.customerPortal : "";

    constructor(public _vmcLogs: VmcLoggerConfigurator,
                private _contextualHelpService: ContextualHelpService,
                public _userAuthentication: AppAuthentication,
                private _vmcMainViews: VmcMainViewsService,
                private router: Router,
                private renderer: Renderer2,
                private _appEvents: AppEventsService,
                private _browserService: BrowserService) {

        _contextualHelpService.contextualHelpData$
            .pipe(cancelOnDestroy(this))
            .subscribe(data => {
                this._contextualHelp = data;
            });

        router.events
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.setSelectedRoute(event.urlAfterRedirects);
                }
            });
        this.menuConfig = this._vmcMainViews.getMenu();
        this.leftMenuConfig = this.menuConfig.filter((item: VMCAppMenuItem) => {
            return item.position === 'left';
        });
        this.rightMenuConfig = this.menuConfig.filter((item: VMCAppMenuItem) => {
            return item.position === 'right';
        });
        if (router.navigated) {
            this.setSelectedRoute(router.routerState.snapshot.url);
        }

        this._powerUser = this._browserService.getInitialQueryParam('mode') === 'poweruser';
    }

    ngOnInit(){
        const cachedVersion = this._browserService.getFromLocalStorage(this._appCachedVersionToken);
        this._showChangelog = cachedVersion !== globalConfig.client.appVersion;
        this._appEvents.event(UpdateMenuEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                if (event.position === 'left') {
                    this.replaceMenu(event.menuID, event.menu);
                }
            });

        this._appEvents.event(ResetMenuEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                const menu = this.menuConfig.filter((item: VMCAppMenuItem) => {
                    return item.position === 'left';
                });
                this.replaceMenu('vmc', menu);
            });

    }

    private replaceMenu(menuID: string,  menu: VMCAppMenuItem[]): void{
        this.renderer.setStyle(this.leftMenu.nativeElement, 'opacity', 0);
        this.renderer.setStyle(this.leftMenu.nativeElement, 'marginLeft', '100px');
        setTimeout( ()=> {
            this.leftMenuConfig = menu;
            this.renderer.setStyle(this.leftMenu.nativeElement, 'opacity', 1);
            this.renderer.setStyle(this.leftMenu.nativeElement, 'marginLeft', '0px');
            this.setSelectedRoute(this.router.routerState.snapshot.url);
            this.menuID = menuID;
        },300);
    }

    setSelectedRoute(path) {
        if (this.menuConfig) {
            this.selectedMenuItem = this.leftMenuConfig.find(item => item.isActiveView(path));
            if (!this.selectedMenuItem){
                this.selectedMenuItem = this.rightMenuConfig.find(item => item.isActiveView(path));
            }
            this.showSubMenu = this.selectedMenuItem && this.selectedMenuItem.children && this.selectedMenuItem.children.length > 0;
        } else {
            this.selectedMenuItem = null;
            this.showSubMenu = false;
        }
    }

    openHelpLink(key) {
        let link = '';
        switch (key){
            case 'manual':
                link = serverConfig.externalLinks.vidiun.userManual;
                break;
            case 'vmcOverview':
                link = serverConfig.externalLinks.vidiun.vmcOverview;
                break;
            case 'mediaManagement':
                link = serverConfig.externalLinks.vidiun.mediaManagement;
                break;
            case 'legacy':
                link = buildBaseUri('/index.php/vmc');
                break;
        }
        if (link.length > 0) {
            this._browserService.openLink(link, {}, '_blank');
        }
        this._helpmenu.close();
    }

    openSupport() {
        this._supportPopup.open();
        this._helpmenu.close();
    }

    navigateToDefault() {
        this.router.navigateByUrl('/content/entries');
    }


    ngOnDestroy() {
    }

    public _changelogPopupOpened(): void {
        this._showChangelog = false;
        this._browserService.setInLocalStorage(this._appCachedVersionToken, globalConfig.client.appVersion);
    }
}

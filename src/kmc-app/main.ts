import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { environment } from 'environments/environment';
import { initializeConfiguration } from '../configuration/server-config-utils';
import { globalConfig } from 'config/global';
import { externalAppsConfigurationAdapter } from 'config/server';

// if CDN is used, change the base uri being used by webpack to fetch static assets
// this feature reuires manipulation on the index.html as well so it should be used
// in production only.
declare var __webpack_require__: any;
declare var kmcConfig;

(function() {
    if (kmcConfig && kmcConfig.kalturaServer && kmcConfig.kalturaServer.deployUrl) {

        __webpack_require__.p = kmcConfig.kalturaServer.deployUrl;
    }
}());

if (environment.production) {
    enableProdMode();
    console.log(`Running KMCng version '${globalConfig.client.appVersion}' (Production mode)`);
} else {
    console.log(`Running KMCng version '${globalConfig.client.appVersion}' (Development mode)`);
}


initializeConfiguration(externalAppsConfigurationAdapter)
    .subscribe(
        () =>
        {
            platformBrowserDynamic().bootstrapModule(AppModule);
        },
        (error) =>
        {
            try {
                const appContainer = document.getElementById('appContainer');
                if (appContainer) {
                    appContainer.remove();
                }

                const errorElement = document.getElementById('appError');
                if (errorElement) {
                    errorElement.style.display = 'block';
                }
            } catch(innerError) {
            }

            console.error(error);
        }
    );

import { Injectable } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { VidiunLanguage } from 'vidiun-ngx-client';

@Injectable()
export class LanguageOptionsService {
    private _options: { value: string, label: string }[] = [];

    constructor(private _appLocalization: AppLocalization) {
        this._prepare();
    }

    private _prepare(): void {
        // load all supported languages
        this._options = [];
        const excludedLanguages = ['he', 'id', 'yi']; // duplicated languages TODO [VMCNG] - should be checked with backend
        for (const lang in VidiunLanguage) {
            if (lang !== 'en' && excludedLanguages.indexOf(lang) === -1) { // we push English to the top of the array after sorting
                const value = lang.toUpperCase();
                const label = this._appLocalization.get(`languages.${value}`);
                const hasTranslation = label.indexOf('languages.') === -1;
                if (hasTranslation) {
                    this._options.push({ value, label});
                }
            }
        }
        // sort the language array by language alphabetically
        this._options.sort((a, b) => {
            const x = a['label'];
            const y = b['label'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        // put English on top
        this._options.unshift({ label: this._appLocalization.get('languages.EN'), value: 'EN' });
    }

    public getLabelByValue(value: string) : VidiunLanguage {
        let result = null;
        if (value) {
            let langCode = value.toString().toLowerCase();
            if (langCode.length === 4) {
                langCode = langCode.substr(0, 2) + langCode.charAt(2).toUpperCase() + langCode.slice(3);
            }
            result = VidiunLanguage[langCode];
        }

        return result;

    }

    public getValueByLabel(label: string) : string {
        let result = null;
        if (label) {
            const excludedLanguages = ['he', 'id', 'yi'];
            for (const lang in VidiunLanguage) {
                if (VidiunLanguage[lang] === label && excludedLanguages.indexOf(lang) === -1) {
                    result = lang.toUpperCase();
                }
            }
        }

        return result;

    }

    public get (): { value: string, label: string }[] {
        return this._options;
    }
}

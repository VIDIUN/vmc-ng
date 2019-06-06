import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@vidiun-ng/mc-shared';
import { CategoryData } from 'app-shared/content-shared/categories/categories-search.service';
import { VidiunPrivacyType } from 'vidiun-ngx-client';
import { VidiunAppearInListType } from 'vidiun-ngx-client';
import { VidiunContributionPolicyType } from 'vidiun-ngx-client';

@Pipe({ name: 'vCategoryTooltip' })
export class CategoryTooltipPipe implements PipeTransform {
    constructor(private _appLocalization: AppLocalization) {
    }

    transform(category: CategoryData): string {
        if (!category.privacyContexts) {
            return category.fullName;
        }

        let result = `${category.fullName}\n`;

        if (category.privacyContext) {
            const title = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.privacyContext');
            result += `${title}: ${category.privacyContext}\n`;
        }

        if (category.privacy) {
            const title = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.contentPrivacy');
            let value = '';
            switch (category.privacy) {
                case VidiunPrivacyType.all:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.noRestriction');
                    break;
                case VidiunPrivacyType.authenticatedUsers:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.requiresAuth');
                    break;
                case VidiunPrivacyType.membersOnly:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.noMembers');
                    break;
                default:
                    break;
            }

            if (!!value) {
                result += `${title}: ${value}\n`;
            }
        }

        if (category.appearInList) {
            let value = '';
            let title = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.categoryListing');
            switch (category.appearInList) {
                case VidiunAppearInListType.categoryMembersOnly:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.private');
                    break;
                case VidiunAppearInListType.partnerOnly:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.noRestriction');
                    break;
                default:
                    break
            }

            if (!!value) {
                result += `${title}: ${value}\n`;
            }

            value = '';
            title = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.contributionPolicy');

            switch (category.contributionPolicy) {
                case VidiunContributionPolicyType.all:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.noRestriction');
                    break;
                case VidiunContributionPolicyType.membersWithContributionPermission:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.private');
                    break;
                default:
                    break;
            }

            if (!!value) {
                result += `${title}: ${value}\n`;
            }

            if (category.membersCount > 0) {
                result += this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.specificEndUserPermissions');
            }
        }

        return result;
    }
}

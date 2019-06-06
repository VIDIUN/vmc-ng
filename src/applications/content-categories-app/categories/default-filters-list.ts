import {VidiunPrivacyType} from 'vidiun-ngx-client';
import {VidiunAppearInListType} from 'vidiun-ngx-client';
import {VidiunContributionPolicyType} from 'vidiun-ngx-client';

export interface DefaultFilterList {
  label: string;
  name: string;
  items: { value: string, label: string }[]
}

export const EntitlementsFiltersList: DefaultFilterList[] = [
  {
    name: 'privacyTypes', label: 'All Content Privacy Options',
    items: [
      {value: VidiunPrivacyType.all.toString(), label: 'No Restriction'},
      {value: VidiunPrivacyType.authenticatedUsers.toString(), label: 'Requires Authentication'},
      {value: VidiunPrivacyType.membersOnly.toString(), label: 'Private'}
    ]
  },
  {
    name: 'categoryListing', label: 'All Category Listing Options',
    items: [
      {value: VidiunAppearInListType.partnerOnly.toString(), label: 'No Restriction'},
      {value: VidiunAppearInListType.categoryMembersOnly.toString(), label: 'Private'}
    ]
  },
  {
    name: 'contributionPolicy', label: 'All Contribution Policy Options',
    items: [
      {value: VidiunContributionPolicyType.all.toString(), label: 'No Restriction'},
      {value: VidiunContributionPolicyType.membersWithContributionPermission.toString(), label: 'Private'}
    ]
  },
  {
    name: 'endUserPermissions', label: 'Specific End-User Permissions',
    items: [
      {value: 'has', label: 'Has Specific End-User Permissions'},
      {value: 'no', label: 'No Specific End-User Permissions'}
    ]
  }
];

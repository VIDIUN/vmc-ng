import {VidiunCategoryUserPermissionLevel} from 'vidiun-ngx-client';
import {VidiunUpdateMethodType} from 'vidiun-ngx-client';
import {VidiunCategoryUserStatus} from 'vidiun-ngx-client';

export interface DefaultFilterList {
  label: string;
  name: string;
  items: { value: string, label: string }[]
}

// TODO [vmcng] - add translations to labels
export const DefaultFiltersList: DefaultFilterList[] = [
  {
    name: 'permissionLevels', label: 'Permission Levels',
    items: [
      {
        value: VidiunCategoryUserPermissionLevel.contributor.toString(),
        label: 'Contributor'
      }, {
        value: VidiunCategoryUserPermissionLevel.moderator.toString(),
        label: 'Moderator'
      }, {
        value: VidiunCategoryUserPermissionLevel.member.toString(),
        label: 'Member'
      }, {
        value: VidiunCategoryUserPermissionLevel.manager.toString(),
        label: 'Manager'
      }
    ]
  },
  {
    name: 'status', label: 'Status',
    items: [
      {value: VidiunCategoryUserStatus.active.toString(), label: 'Active'},
      {value: VidiunCategoryUserStatus.notActive.toString(), label: 'Deactivated'}
    ]
  },
  {
    name: 'updateMethod', label: 'Update Method',
    items: [
      {
        value: VidiunUpdateMethodType.manual.toString(),
        label: 'Manual'
      },
      {
        value: VidiunUpdateMethodType.automatic.toString(),
        label: 'Automatic'
      }
    ]
  },
];

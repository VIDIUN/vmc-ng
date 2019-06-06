import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions/vmc-permissions';

export interface PermissionTreeNode {
  value: VMCPermissions;
  name?: string; // the name will be added by the service
  label: string;
  isAdvancedGroup?: boolean;
  items?: PermissionTreeNode[];
  noChildren?: boolean;
}

export const PermissionTreeNodes: PermissionTreeNode[] = [
  {
    value: VMCPermissions.CONTENT_INGEST_BASE,
    label: 'Content Ingestion',
    isAdvancedGroup: false,
    items: [
        {
            value: VMCPermissions.CONTENT_INGEST_UPLOAD,
            label: 'Upload from Desktop'
        },
      {
        value: VMCPermissions.CONTENT_INGEST_BULK_UPLOAD,
        label: 'Import Files & Bulk Upload'
      },
      {
        value: VMCPermissions.CONTENT_INGEST_REMOTE_STORAGE,
        label: 'Set Link to Files on Remote Storage'
      },
      {
        value: VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_MATCH,
        label: 'Match Media Files from Drop Folder'
      },
      {
        value: VMCPermissions.CONTENT_INGEST_EXTERNAL_SEARCH,
        label: 'Import from Web',
      },
      {
        value: VMCPermissions.CONTENT_INGEST_WEBCAM,
        label: 'Record from Webcam',
      },
      {
        value: VMCPermissions.CONTENT_INGEST_ORPHAN_VIDEO,
        label: 'Prepare Video Entry',
      },
      {
        value: VMCPermissions.CONTENT_INGEST_ORPHAN_AUDIO,
        label: 'Prepare Audio Entry',
      },
      {
        value: VMCPermissions.LIVE_STREAM_ADD,
        label: 'Prepare Live Stream Entry'
      },
    ]
  },
  {
    value: VMCPermissions.CONTENT_MANAGE_BASE,
    label: 'Content Management',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.CONTENT_MANAGE_METADATA,
        label: 'Modify Metadata'
      },
      {
        value: VMCPermissions.CONTENT_INGEST_REFERENCE_MODIFY,
        label: 'View / Modify Reference name'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES,
        label: 'Modify Entry\'s Category'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_THUMBNAIL,
        label: 'Modify Thumbnail'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_SCHEDULE,
        label: 'Modify Scheduling'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL,
        label: 'Modify Access Control'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_CUSTOM_DATA,
        label: 'Modify Custom Data'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_ENTRY_USERS,
        label: 'Modify Entry\'s User Settings'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_DELETE,
        label: 'Delete Content'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_EMBED_CODE,
        label: 'Grab Embed Code'
      },
      {
        value: VMCPermissions.CONTENT_INGEST_INTO_ORPHAN,
        label: 'Add Media to an Entry'
      },
      {
        value: VMCPermissions.CONTENT_INGEST_INTO_READY,
        label: 'Replace Entry\'s Media'
      },
      {
        value: VMCPermissions.CONTENT_INGEST_REPLACE,
        label: 'Approve Media Replacement'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_RECONVERT,
        label: 'Manage Flavors'
      },
      {
        value: VMCPermissions.CONTENT_INGEST_CLIP_MEDIA,
        label: 'Clipping'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES,
        label: 'Edit Categories'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS,
        label: 'Edit Category\'s Entitlement Settings'
      },
      {
        value: VMCPermissions.LIVE_STREAM_UPDATE,
        label: 'Update Live Stream'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_DOWNLOAD,
        label: 'Download Files'
      },
      {
        value: VMCPermissions.CUEPOINT_MANAGE,
        label: 'Edit Entry Advertisement'
      },
      {
        value: VMCPermissions.CAPTION_MODIFY,
        label: 'Edit Entry Captions'
      },
      {
        value: VMCPermissions.ATTACHMENT_MODIFY,
        label: 'Edit Related Files'
      }
    ]
  },
  {
    value: VMCPermissions.BULK_LOG_BASE,
    label: 'Bulk Upload Log',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.BULK_LOG_DOWNLOAD,
        label: 'Download Bulk Upload Files'
      },
      {
        value: VMCPermissions.BULK_LOG_DELETE,
        label: 'Delete Bulk Upload Items'
      }
    ]
  },
  {
    value: VMCPermissions.CONTENT_MODERATE_BASE,
    label: 'Content Moderation',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.CONTENT_MODERATE_APPROVE_REJECT,
        label: 'Approve/Reject Content'
      },
      {
        value: VMCPermissions.CONTENT_MODERATE_METADATA,
        label: 'Moderate Metadata'
      },
      {
        value: VMCPermissions.CONTENT_MODERATE_CUSTOM_DATA,
        label: 'Moderate Custom Metadata'
      }
    ]
  },
  {
    value: VMCPermissions.PLAYLIST_BASE,
    label: 'Playlist Management',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.PLAYLIST_ADD,
        label: 'Create Playlists'
      },
      {
        value: VMCPermissions.PLAYLIST_UPDATE,
        label: 'Modify Playlists'
      },
      {
        value: VMCPermissions.PLAYLIST_DELETE,
        label: 'Delete Playlists'
      },
      {
        value: VMCPermissions.PLAYLIST_EMBED_CODE,
        label: 'Grab Playlist Embed Code'
      }
    ]
  },
  {
    value: VMCPermissions.SYNDICATION_BASE,
    label: 'Syndication Management',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.SYNDICATION_ADD,
        label: 'Create Syndication Feeds'
      },
      {
        value: VMCPermissions.SYNDICATION_UPDATE,
        label: 'Modify Syndication Feeds'
      },
      {
        value: VMCPermissions.SYNDICATION_DELETE,
        label: 'Delete Syndication Feeds'
      }
    ]
  },
  {
    value: VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_BASE,
    label: 'Content Distribution',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_WHERE,
        label: 'Select Distribution Points'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_SEND,
        label: 'Distribute'
      },
      {
        value: VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_REMOVE,
        label: 'Remove Distributed Content'
      }
    ]
  },
  {
    value: VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_BASE,
    label: 'Drop Folders Control',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_DELETE,
        label: 'Delete Files'
      }
    ]
  },
  {
    value: VMCPermissions.STUDIO_BASE,
    label: 'Studio',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.STUDIO_ADD_UICONF,
        label: 'Create Players'
      },
      {
        value: VMCPermissions.STUDIO_UPDATE_UICONF,
        label: 'Modify Players'
      },
      {
        value: VMCPermissions.STUDIO_DELETE_UICONF,
        label: 'Delete Players'
      },
      {
        value: VMCPermissions.STUDIO_SELECT_CONTENT,
        label: 'Select Player Content'
      }
    ]
  },
  {
    value: VMCPermissions.ADVERTISING_UPDATE_SETTINGS,
    label: 'Set Advertising Settings',
    noChildren: true
  },
  {
    value: VMCPermissions.ANALYTICS_BASE,
    label: 'Video Analytics',
    noChildren: true
  },
  {
    value: VMCPermissions.ACCOUNT_BASE,
    label: 'Account Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.ACCOUNT_UPDATE_SETTINGS,
        label: 'Modify Account Settings'
      }
    ]
  },
  {
    value: VMCPermissions.INTEGRATION_BASE,
    label: 'Integration Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.INTEGRATION_UPDATE_SETTINGS,
        label: 'Modify Integration Settings'
      }
    ]
  },
  {
    value: VMCPermissions.ACCESS_CONTROL_BASE,
    label: 'Access Control Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.ACCESS_CONTROL_ADD,
        label: 'Create Access Control Profiles'
      },
      {
        value: VMCPermissions.ACCESS_CONTROL_UPDATE,
        label: 'Modify Access Control Profiles'
      },
      {
        value: VMCPermissions.ACCESS_CONTROL_DELETE,
        label: 'Delete Access Control Profiles'
      }
    ]
  },
  {
    value: VMCPermissions.TRANSCODING_BASE,
    label: 'Transcoding Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.TRANSCODING_ADD,
        label: 'Create Transcoding Profiles'
      },
      {
        value: VMCPermissions.TRANSCODING_UPDATE,
        label: 'Modify Transcoding Profiles'
      },
      {
        value: VMCPermissions.TRANSCODING_DELETE,
        label: 'Delete Transcoding Profiles'
      }
    ]
  },
  {
    value: VMCPermissions.CUSTOM_DATA_PROFILE_BASE,
    label: 'Custom Metadata Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: VMCPermissions.CUSTOM_DATA_PROFILE_ADD,
        label: 'Add Custom Metadata Schemas'
      },
      {
        value: VMCPermissions.CUSTOM_DATA_PROFILE_UPDATE,
        label: 'Modify Custom Metadata Schemas'
      },
      {
        value: VMCPermissions.CUSTOM_DATA_PROFILE_DELETE,
        label: 'Delete Custom Metadata Schemas'
      }
    ]
  },
    {
        value: VMCPermissions.ADMIN_BASE,
        label: 'Administration',
        isAdvancedGroup: true,
        items: [
            {
                value: VMCPermissions.ADMIN_USER_ADD,
                label: 'Create Users'
            },
            {
                value: VMCPermissions.ADMIN_USER_UPDATE,
                label: 'Modify Users'
            },
            {
                value: VMCPermissions.ADMIN_USER_DELETE,
                label: 'Delete Users'
            },
            {
                value: VMCPermissions.ADMIN_ROLE_ADD,
                label: 'Create Roles'
            },
            {
                value: VMCPermissions.ADMIN_ROLE_UPDATE,
                label: 'Modify Roles'
            },
            {
                value: VMCPermissions.ADMIN_ROLE_DELETE,
                label: 'Delete Roles'
            },
            {
                value: VMCPermissions.ADMIN_USER_BULK,
                label: 'End-User Bulk Upload'
            }
        ]
    }
];

import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions/vmc-permissions';

export const VMCPermissionsRules : {
    customPermissionKeyToNameMapping: { [key: number]: string},
    requiredPermissionMapping: { [key: number]: VMCPermissions},
    linkedPermissionMapping: { [key: number]: VMCPermissions}
} = {
    customPermissionKeyToNameMapping: {
      [VMCPermissions.CUEPOINT_MANAGE]: 'cuePoint.MANAGE',
      [VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_DELETE]: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_DELETE',
      [VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_MATCH]: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_MATCH',
      [VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_BASE]: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_BASE'
    },
    requiredPermissionMapping: {
        [VMCPermissions.CONTENT_INGEST_REMOTE_STORAGE]: VMCPermissions.FEATURE_REMOTE_STORAGE_INGEST,
        [VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_MATCH]: VMCPermissions.CONTENT_INGEST_DROP_FOLDER_MATCH,
        [VMCPermissions.LIVE_STREAM_ADD]: VMCPermissions.FEATURE_LIVE_STREAM,
        [VMCPermissions.CONTENT_MANAGE_CUSTOM_DATA]: VMCPermissions.METADATA_PLUGIN_PERMISSION,
        [VMCPermissions.CONTENT_MANAGE_ENTRY_USERS]: VMCPermissions.FEATURE_END_USER_MANAGE,
        [VMCPermissions.CONTENT_INGEST_INTO_READY]: VMCPermissions.FEATURE_ENTRY_REPLACEMENT,
        [VMCPermissions.CONTENT_INGEST_REPLACE]: VMCPermissions.FEATURE_ENTRY_REPLACEMENT_APPROVAL,
        [VMCPermissions.CONTENT_INGEST_CLIP_MEDIA]: VMCPermissions.FEATURE_CLIP_MEDIA,
        [VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS]: VMCPermissions.FEATURE_ENTITLEMENT,
        [VMCPermissions.LIVE_STREAM_UPDATE]: VMCPermissions.FEATURE_LIVE_STREAM,
        [VMCPermissions.CUEPOINT_MANAGE]: VMCPermissions.ADCUEPOINT_PLUGIN_PERMISSION,
        [VMCPermissions.CAPTION_MODIFY]: VMCPermissions.CAPTION_PLUGIN_PERMISSION,
        [VMCPermissions.ATTACHMENT_MODIFY]: VMCPermissions.ATTACHMENT_PLUGIN_PERMISSION,
        [VMCPermissions.CONTENT_MODERATE_CUSTOM_DATA]: VMCPermissions.METADATA_PLUGIN_PERMISSION,
        [VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_BASE]: VMCPermissions.CONTENTDISTRIBUTION_PLUGIN_PERMISSION,
        [VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_WHERE]: VMCPermissions.CONTENTDISTRIBUTION_PLUGIN_PERMISSION,
        [VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_SEND]: VMCPermissions.CONTENTDISTRIBUTION_PLUGIN_PERMISSION,
        [VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_REMOVE]: VMCPermissions.CONTENTDISTRIBUTION_PLUGIN_PERMISSION,
        [VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_BASE]: VMCPermissions.DROPFOLDER_PLUGIN_PERMISSION,
        [VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_DELETE]: VMCPermissions.DROPFOLDER_PLUGIN_PERMISSION,
        [VMCPermissions.ADVERTISING_UPDATE_SETTINGS]: VMCPermissions.FEATURE_VAST,
        [VMCPermissions.ANALYTICS_BASE]: VMCPermissions.FEATURE_ANALYTICS_TAB,
        [VMCPermissions.CUSTOM_DATA_PROFILE_BASE]: VMCPermissions.METADATA_PLUGIN_PERMISSION,
        [VMCPermissions.CUSTOM_DATA_PROFILE_ADD]: VMCPermissions.METADATA_PLUGIN_PERMISSION,
        [VMCPermissions.CUSTOM_DATA_PROFILE_UPDATE]: VMCPermissions.METADATA_PLUGIN_PERMISSION,
        [VMCPermissions.CUSTOM_DATA_PROFILE_DELETE]: VMCPermissions.METADATA_PLUGIN_PERMISSION,
        [VMCPermissions.ADMIN_USER_BULK]: VMCPermissions.FEATURE_END_USER_MANAGE
    },
    linkedPermissionMapping: {
        [VMCPermissions.ACCESS_CONTROL_ADD]: VMCPermissions.ACCESS_CONTROL_BASE,
        [VMCPermissions.ACCESS_CONTROL_DELETE]: VMCPermissions.ACCESS_CONTROL_BASE,
        [VMCPermissions.ACCESS_CONTROL_UPDATE]: VMCPermissions.ACCESS_CONTROL_BASE,
        [VMCPermissions.ACCOUNT_UPDATE_SETTINGS]: VMCPermissions.ACCOUNT_BASE,
        [VMCPermissions.ADMIN_ROLE_ADD]: VMCPermissions.ADMIN_BASE,
        [VMCPermissions.ADMIN_ROLE_DELETE]: VMCPermissions.ADMIN_BASE,
        [VMCPermissions.ADMIN_ROLE_UPDATE]: VMCPermissions.ADMIN_BASE,
        [VMCPermissions.ADMIN_USER_ADD]: VMCPermissions.ADMIN_BASE,
        [VMCPermissions.ADMIN_USER_BULK]: VMCPermissions.ADMIN_BASE,
        [VMCPermissions.ADMIN_USER_DELETE]: VMCPermissions.ADMIN_BASE,
        [VMCPermissions.ADMIN_USER_UPDATE]: VMCPermissions.ADMIN_BASE,
        [VMCPermissions.ATTACHMENT_MODIFY]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.BULK_LOG_DELETE]: VMCPermissions.BULK_LOG_BASE,
        [VMCPermissions.BULK_LOG_DOWNLOAD]: VMCPermissions.BULK_LOG_BASE,
        [VMCPermissions.CAPTION_MODIFY]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_INGEST_BULK_UPLOAD]: VMCPermissions.CONTENT_INGEST_BASE,
        [VMCPermissions.CONTENT_INGEST_CLIP_MEDIA]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_INGEST_EXTERNAL_SEARCH]: VMCPermissions.CONTENT_INGEST_BASE,
        [VMCPermissions.CONTENT_INGEST_INTO_ORPHAN]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_INGEST_INTO_READY]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_INGEST_ORPHAN_AUDIO]: VMCPermissions.CONTENT_INGEST_BASE,
        [VMCPermissions.CONTENT_INGEST_ORPHAN_VIDEO]: VMCPermissions.CONTENT_INGEST_BASE,
        [VMCPermissions.CONTENT_INGEST_REFERENCE_MODIFY]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_INGEST_REMOTE_STORAGE]: VMCPermissions.CONTENT_INGEST_BASE,
        [VMCPermissions.CONTENT_INGEST_REPLACE]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_INGEST_UPLOAD]: VMCPermissions.CONTENT_INGEST_BASE,
        [VMCPermissions.CONTENT_INGEST_WEBCAM]: VMCPermissions.CONTENT_INGEST_BASE,
        [VMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_CATEGORY_USERS]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_CUSTOM_DATA]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_DELETE]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_REMOVE]: VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_BASE,
        [VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_SEND]: VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_BASE,
        [VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_WHERE]: VMCPermissions.CONTENT_MANAGE_DISTRIBUTION_BASE,
        [VMCPermissions.CONTENT_MANAGE_DOWNLOAD]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_EMBED_CODE]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_ENTRY_USERS]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_METADATA]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_RECONVERT]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_SCHEDULE]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MANAGE_THUMBNAIL]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CONTENT_MODERATE_APPROVE_REJECT]: VMCPermissions.CONTENT_MODERATE_BASE,
        [VMCPermissions.CONTENT_MODERATE_CUSTOM_DATA]: VMCPermissions.CONTENT_MODERATE_BASE,
        [VMCPermissions.CONTENT_MODERATE_METADATA]: VMCPermissions.CONTENT_MODERATE_BASE,
        [VMCPermissions.CUEPOINT_MANAGE]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.CUSTOM_DATA_PROFILE_ADD]: VMCPermissions.CUSTOM_DATA_PROFILE_BASE,
        [VMCPermissions.CUSTOM_DATA_PROFILE_DELETE]: VMCPermissions.CUSTOM_DATA_PROFILE_BASE,
        [VMCPermissions.CUSTOM_DATA_PROFILE_UPDATE]: VMCPermissions.CUSTOM_DATA_PROFILE_BASE,
        [VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_DELETE]: VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_BASE,
        [VMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_MATCH]: VMCPermissions.CONTENT_INGEST_BASE,
        [VMCPermissions.INTEGRATION_UPDATE_SETTINGS]: VMCPermissions.INTEGRATION_BASE,
        [VMCPermissions.LIVE_STREAM_ADD]: VMCPermissions.CONTENT_INGEST_BASE,
        [VMCPermissions.LIVE_STREAM_UPDATE]: VMCPermissions.CONTENT_MANAGE_BASE,
        [VMCPermissions.PLAYLIST_ADD]: VMCPermissions.PLAYLIST_BASE,
        [VMCPermissions.PLAYLIST_DELETE]: VMCPermissions.PLAYLIST_BASE,
        [VMCPermissions.PLAYLIST_EMBED_CODE]: VMCPermissions.PLAYLIST_BASE,
        [VMCPermissions.PLAYLIST_UPDATE]: VMCPermissions.PLAYLIST_BASE,
        [VMCPermissions.STUDIO_ADD_UICONF]: VMCPermissions.STUDIO_BASE,
        [VMCPermissions.STUDIO_DELETE_UICONF]: VMCPermissions.STUDIO_BASE,
        [VMCPermissions.STUDIO_SELECT_CONTENT]: VMCPermissions.STUDIO_BASE,
        [VMCPermissions.STUDIO_UPDATE_UICONF]: VMCPermissions.STUDIO_BASE,
        [VMCPermissions.SYNDICATION_ADD]: VMCPermissions.SYNDICATION_BASE,
        [VMCPermissions.SYNDICATION_DELETE]: VMCPermissions.SYNDICATION_BASE,
        [VMCPermissions.SYNDICATION_UPDATE]: VMCPermissions.SYNDICATION_BASE,
        [VMCPermissions.TRANSCODING_ADD]: VMCPermissions.TRANSCODING_BASE,
        [VMCPermissions.TRANSCODING_DELETE]: VMCPermissions.TRANSCODING_BASE,
        [VMCPermissions.TRANSCODING_UPDATE]: VMCPermissions.TRANSCODING_BASE,
    }
};
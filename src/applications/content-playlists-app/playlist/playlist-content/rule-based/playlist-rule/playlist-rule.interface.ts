import { VidiunMediaEntryFilterForPlaylist } from 'vidiun-ngx-client';
import { VidiunPlayableEntryOrderBy } from 'vidiun-ngx-client';

export interface PlaylistRule {
  selectionId?: string;
  name: string;
  entriesCount: number;
  entriesDuration: number;
  orderBy: VidiunPlayableEntryOrderBy;
  limit: number;
  originalFilter: VidiunMediaEntryFilterForPlaylist
}

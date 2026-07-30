export interface InstagramAuthConfig {
  appId: string;
  redirectUri: string;
  scope: string;
  accessToken?: string;
  instagramUserId?: string;
  username?: string;
}

export interface PublishPostDraft {
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption: string;
  mediaFile?: File;
  previewUrl?: string;
}

export interface PublishLogEntry {
  id: string;
  timestamp: Date;
  type: 'INFO' | 'SUCCESS' | 'ERROR';
  action: string;
  details: string;
}

export interface InstagramPublishState {
  auth: InstagramAuthConfig;
  draft: PublishPostDraft;
  isPublishing: boolean;
  isLoggingIn: boolean;
  logs: PublishLogEntry[];
  mode: 'MOCK' | 'LIVE';
}

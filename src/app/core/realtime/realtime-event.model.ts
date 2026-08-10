export type RealtimeConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface DirectChatMessage {
  type: string;
  senderUserId: string;
  recipientUserId: string;
  message: string;
  occurredAt: string;
}

export interface RealtimeServerEvents {
  directMessage: DirectChatMessage;
}

export type RealtimeServerEventName = keyof RealtimeServerEvents;

export const ApplicationRealtimeEvents = {
  DirectMessage: 'directMessage',
} as const;

export const ApplicationRealtimeMethods = {
  SendDirectMessage: 'SendDirectMessage',
} as const;

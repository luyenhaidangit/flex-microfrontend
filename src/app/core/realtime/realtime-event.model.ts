export type RealtimeConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface DirectChatMessage {
  type: string;
  senderUserId: string;
  recipientUserId: string;
  message: string;
  occurredAt: string;
}

export interface RealtimeServerEvents {
  'message.created': DirectChatMessage;
}

export type RealtimeServerEventName = keyof RealtimeServerEvents;

export const ApplicationRealtimeEvents = {
  MessageCreated: 'message.created',
} as const;

export const ApplicationRealtimeMethods = {
  SendMessage: 'SendMessage',
} as const;

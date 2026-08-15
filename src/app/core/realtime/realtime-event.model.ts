export type RealtimeConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface DirectChatMessage {
  type: string;
  senderUserId: string;
  recipientUserId: string;
  message: string;
  occurredAt: string;
}

export interface ConversationRealtimeMessage {
  messageId: string;
  conversationId: string;
  tenantId: string;
  sequenceNo: number;
  role: string;
  actorType: string;
  actorId?: string;
  status: string;
  contentType: string;
  content?: string;
  occurredAt: string;
}

export interface RealtimeServerEvents {
  'message.created': DirectChatMessage;
  'conversation.message.created': ConversationRealtimeMessage;
}

export type RealtimeServerEventName = keyof RealtimeServerEvents;

export const ApplicationRealtimeEvents = {
  MessageCreated: 'message.created',
  ConversationMessageCreated: 'conversation.message.created',
} as const;

export const ApplicationRealtimeMethods = {
  SendMessage: 'SendMessage',
} as const;

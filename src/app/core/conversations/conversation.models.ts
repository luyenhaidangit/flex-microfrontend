export type ConversationStatus = 'active' | 'suspended' | 'inactive';
export enum ConversationSource {
  Production = 1,
  Preview = 2,
  Playground = 3,
  Api = 4,
}
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';
export type MessageActorType = 'end_user' | 'ai_agent' | 'human_agent' | 'system' | 'tool' | 'automation';
export type MessageStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Conversation {
  id: string;
  tenantId: string;
  createdBy: string;
  title?: string;
  status: ConversationStatus | string;
  lastSequenceNo: number;
  lastMessageId?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  conversationSource: ConversationSource | null;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  sequenceNo: number;
  clientMessageId?: string;
  role: MessageRole | string;
  actorType: MessageActorType | string;
  actorId?: string;
  contentType: string;
  content?: string;
  status: MessageStatus | string;
  metadata: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface CreateMessageRequest {
  clientMessageId: string;
  contentType: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface ConversationRealtimeMessage extends ConversationMessage {
  tenantId: string;
  occurredAt: string;
}

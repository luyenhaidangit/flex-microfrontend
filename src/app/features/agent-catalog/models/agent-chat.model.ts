export interface AgentChatRequest {
  conversationId: string;
  message: string;
  agentId?: string;
  modelId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentChatResponse {
  reply: string;
  model?: string;
}

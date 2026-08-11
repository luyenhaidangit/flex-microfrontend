export interface AgentPreviewMessage { role: 'user' | 'agent'; content: string; }
export interface AgentPreviewRequest { agent: { name: string; role: string; instructions: string }; messages: AgentPreviewMessage[]; }
export interface AgentPreviewResponse { reply: string; model?: string; }

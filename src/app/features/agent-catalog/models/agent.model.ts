export interface Agent {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  description?: string | null;
}

export interface UpdateAgentRequest {
  name: string;
  description?: string | null;
}

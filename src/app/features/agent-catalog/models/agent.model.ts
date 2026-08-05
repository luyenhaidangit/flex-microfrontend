export interface PublishLocation {
  locationCode: string;
  isEnabled: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  publishLocations?: PublishLocation[];
}

export interface CreateAgentRequest {
  name: string;
  description?: string | null;
  status?: string;
  publishLocations?: PublishLocation[];
}

export interface UpdateAgentRequest {
  name: string;
  description?: string | null;
  status?: string;
  publishLocations?: PublishLocation[];
}

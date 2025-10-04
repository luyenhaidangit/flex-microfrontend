export interface WorkflowFilter {
  keyword: string;
  state: string | null;
  onlyActive: boolean | null;
  type: string | null;
}

export interface WorkflowDefinitionItem {
  code: string;
  name: string;
  version: number;
  state: 'Draft' | 'Active' | 'Deprecated';
  isActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface WorkflowPendingItem {
  requestId: number;
  code: string;
  name: string;
  version: number;
  action: string; // publish|deprecate|update
  requestedDate: string;
  requestedBy: string;
}



export interface Role {
  id: number;
  name: string;
  normalizedName?: string;
  concurrencyStamp?: string;
  code: string;
  description?: string;
  isActive: 'Y' | 'N' | boolean; // Database returns 'Y'/'N', but API might convert to boolean
  createdAt: string;
  lastUpdated?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  version?: number;
  parentId?: number;
  makerId?: string;
  checkerId?: string;
  requestId?: number;
  // Additional fields from API response
  requestedBy?: string;
  requestedDate?: string;
  approveDate?: string;
  pendingAction?: 'CREATE' | 'UPDATE' | 'DELETE';
  requestType?: 'CREATE' | 'UPDATE' | 'DELETE';
}

export interface RoleSearchParams {
  pageIndex: number;
  pageSize: number;
  keyword?: string;
  isActive?: 'Y' | 'N' | null;
}

export interface PagingState {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  keyword?: string;
  isActive?: boolean | null;
  createdDate?: Date | null;
}

export interface PagingRequest {
  pageIndex: number;
  pageSize: number;
  keyword?: string;
  isActive?: boolean;
  createdDate?: string;
}

export interface RequestDetailData {
  requestId: string;
  createdBy: string;
  createdDate: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  oldData?: any;
  newData?: any;
  rejectReason?: string;
  rejectedBy?: string;
  rejectedDate?: string;
} 
export interface BranchFilter {
  keyword: string;
  isActive?: boolean | null;
  type?: 'CREATE' | 'UPDATE' | 'DELETE' | null;
}

export interface BranchItem {
  id?: number;
  code: string;
  name: string;
  description?: string;
  branchType?: number;
  isActive?: boolean | string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // For pending requests
  requestId?: number;
  requestType?: string;
  createdBy?: string;
  requestedBy?: string;
  requestedDate?: string;
  createdDate?: string;
}

export interface BranchSearchParams {
  pageIndex: number;
  pageSize: number;
  keyword?: string | null;
  isActive?: string | null;
  type?: string | null;
}

export interface PagingState {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  keyword: string;
  isActive: boolean | null;
  type: string | null;
}

export interface BranchDetailData {
  branchCode?: string;
  branchName?: string;
  description?: string;
  branchType?: number;
  isActive?: boolean | string;
}

export interface RequestDetailData {
  requestId: number;
  type: string;
  createdBy: string;
  createdDate: string;
  oldData?: BranchDetailData;
  newData?: BranchDetailData;
  rejectReason?: string;
  rejectedBy?: string;
  rejectedDate?: string;
}

export interface CreateBranchRequest {
  code: string;
  name: string;
  description?: string;
  branchType: number;
  isActive: boolean;
}

export interface UpdateBranchRequest {
  name: string;
  description?: string;
  branchType: number;
  isActive: boolean;
  comment?: string;
}

export interface DeleteBranchRequest {
  comment: string;
}

export interface BranchChangeHistory {
  operation: string;
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  comments?: string;
}

// Helper function for branch type labels
export function getBranchTypeLabel(branchType: number): string {
  switch (branchType) {
    case 1: return 'Hội sở chính';
    case 2: return 'Chi nhánh';
    case 3: return 'Phòng giao dịch';
    default: return 'Không xác định';
  }
}
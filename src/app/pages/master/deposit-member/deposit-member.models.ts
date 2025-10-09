export interface DepositMemberItem {
  id?: number;
  depositCode: string;
  shortName: string;
  fullName: string;
  bicCode?: string;
}

export interface DepositMemberSearchParams {
  pageIndex: number;
  pageSize: number;
  depositCode?: string | null;
  shortName?: string | null;
  fullName?: string | null;
  sortColumn?: 'depositCode' | 'shortName' | 'fullName' | 'bicCode';
  sortDirection?: 'asc' | 'desc';
}

export interface PagedResponse<T> {
  isSuccess?: boolean;
  data?: {
    items?: T[];
    totalItems?: number;
    totalPages?: number;
    pageIndex?: number;
    pageSize?: number;
  } | null;
}

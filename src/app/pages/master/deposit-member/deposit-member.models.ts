export interface DepositMemberItem {
  id?: number;
  depositCode: string;
  shortName: string;
  fullName: string;
}

export interface DepositMemberSearchParams {
  pageIndex: number;
  pageSize: number;
  depositCode?: string | null;
  shortName?: string | null;
  fullName?: string | null;
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


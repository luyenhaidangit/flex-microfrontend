export interface IssuerFilter {
	keyword: string;
	status?: string;
	type?: 'CREATE' | 'UPDATE' | 'DELETE' | null;
}
export interface IssuerItem {
	id: number;
	issuerCode: string;
	email?: string;
	issuerName?: string;
	branchName?: string;
	isActive?: boolean;
	createdAt?: string;
}
export interface IssuerSearchParams {
	pageIndex: number;
	pageSize: number;
	keyword?: string | null;
	branchId?: number | null;
	status?: string; // Thêm status để phân biệt tab approved/pending
}

export interface PagingState {
	pageIndex: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	keyword: string;
	branchId: number | null;
}

export interface UpdateIssuerRequest {
	issuerCode: string;
	email: string;
	issuerName: string;
	branchId: number;
	isActive: boolean;
}

// Backwards-compatible aliases for existing code
export type UserFilter = IssuerFilter;
export type UserItem = IssuerItem;
export type UserSearchParams = IssuerSearchParams;
export type UpdateUserRequest = UpdateIssuerRequest;


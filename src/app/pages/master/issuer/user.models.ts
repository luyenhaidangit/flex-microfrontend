export interface IssuerFilter {
	keyword: string;
	branchId: number;
	status?: string;
	type?: 'CREATE' | 'UPDATE' | 'DELETE' | null;
}
export interface IssuerItem {
	id: number;
	issuerCode: string;
	email?: string;
	issuerName?: string;
	branchId?: number;
	branchName?: string;
	branch?: BranchItem; // Full branch object from API
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

export interface BranchItem {
	id: number;
	name: string;
	code?: string;
}

export interface UpdateIssuerRequest {
	issuerCode: string;
	email: string;
	issuerName: string;
	branchId: number;
	isActive: boolean;
}


export interface UserItem {
	id: number;
	userName: string;
	email?: string;
	fullName?: string;
	branchId?: number;
	branchName?: string;
	isActive?: boolean;
	createdAt?: string;
}

export interface UserFilter {
	keyword: string;
	branchId: number | null;
	status?: string;
	type?: 'CREATE' | 'UPDATE' | 'DELETE' | null;
}
export interface UserSearchParams {
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


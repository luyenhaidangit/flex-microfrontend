export interface UserItem {
	id: number;
	userName: string;
	email?: string;
	fullName?: string;
	branchId?: number;
	branchName?: string;
	isLocked?: boolean;
	createdAt?: string;
}

export interface UserSearchParams {
	pageIndex: number;
	pageSize: number;
	keyword?: string | null;
	branchId?: number | null;
	isLocked?: boolean | null;
}

export interface PagingState {
	pageIndex: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	keyword: string;
	isLocked: boolean | null;
	branchId: number | null;
}



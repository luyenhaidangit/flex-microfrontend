/**
 * Common API Response Types
 * Shared across all modules for consistent API communication
 */

// Generic API Response wrapper
export interface ApiResponse<T> {
  isSuccess?: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// Paged API Response
export interface PagedResponse<T> {
  isSuccess?: boolean;
  data?: {
    items?: T[];
    totalItems?: number;
    totalPages?: number;
    pageIndex?: number;
    pageSize?: number;
  } | null;
  message?: string;
  errors?: string[];
}

// Paging Parameters for API requests
export interface PagingParams {
  pageIndex: number;
  pageSize: number;
}

// Sorting Parameters for API requests
export interface SortingParams {
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

// Combined Paging and Sorting for API requests
export interface PagingSortingParams extends PagingParams, SortingParams {}

// Generic Search Parameters
export interface SearchParams extends PagingSortingParams {
  searchTerm?: string;
}

// File Upload Response
export interface FileUploadResponse {
  isSuccess?: boolean;
  data?: {
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    uploadDate?: string;
  };
  message?: string;
  errors?: string[];
}

// Import/Export Response
export interface ImportExportResponse {
  isSuccess?: boolean;
  data?: {
    id?: string;
    status?: 'Pending' | 'Completed' | 'Failed';
    recordCount?: number;
    errorCount?: number;
    errors?: string[];
  };
  message?: string;
}

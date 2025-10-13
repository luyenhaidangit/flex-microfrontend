/**
 * Query and State Management Models
 * For internal component state management
 */

export interface Paging { 
  index: number; 
  size: number; 
}

export interface PageMeta { 
  totalItems: number; 
  totalPages: number; 
}

export interface ListState<F> {
  paging: Paging;
  filter: F;
}

// Re-export commonly used types from api.models for convenience
export type { 
  PagedResponse, 
  PagingParams, 
  SortingParams, 
  PagingSortingParams,
  SearchParams 
} from './api.models';
import { PagedResponse, PagingSortingParams } from '../../../core/models/api.models';

/**
 * Deposit Member specific models
 * Domain-specific interfaces for deposit member functionality
 */

export interface DepositMemberItem {
  id?: number;
  depositCode: string;
  shortName: string;
  fullName: string;
  bicCode?: string;
}

export interface DepositMemberSearchParams extends PagingSortingParams {
  depositCode?: string | null;
  shortName?: string | null;
  fullName?: string | null;
  bicCode?: string | null;
  sortColumn?: 'depositCode' | 'shortName' | 'fullName' | 'bicCode';
}

// Re-export PagedResponse for convenience (can be removed if importing from core/models directly)
export type { PagedResponse } from '../../../core/models/api.models';

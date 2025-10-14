import { PagingSortingParams } from '../../../core/models/api.models';

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

export interface StagedFileInfo {
  fileName: string;
  effectiveDate: string;
}
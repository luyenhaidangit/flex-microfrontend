import { PagingSortingParams } from '../../../core/models/api.models';

export interface SecuritiesDomainItem {
  domainCode: string;
  domainName: string;
  settlementType?: string;
  settlementCycle?: string | number;
  secSettlementType?: string;
  cashSettleType?: string;
  isDefault?: boolean;
}

export interface SecuritiesDomainSearchParams extends PagingSortingParams {
  domainCode?: string | null;
  domainName?: string | null;
  isDefault?: boolean | null;
  sortColumn?:
    | 'domainCode'
    | 'domainName'
    | 'settlementType'
    | 'settlementCycle'
    | 'secSettlementType'
    | 'cashSettleType'
    | 'isDefault';
}


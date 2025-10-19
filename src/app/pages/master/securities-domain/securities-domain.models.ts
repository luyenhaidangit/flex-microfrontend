import { PagingParams } from '../../../core/models/api.models';

export interface SecuritiesDomainItem {
  domainCode: string;
  domainName: string;
  settlementType?: string;
  settlementCycle?: string | number;
  secSettlementType?: string;
  cashSettleType?: string;
  isDefault?: boolean;
}

export interface SecuritiesDomainSearchParams extends PagingParams {
  domainCode?: string | null;
  domainName?: string | null;
}

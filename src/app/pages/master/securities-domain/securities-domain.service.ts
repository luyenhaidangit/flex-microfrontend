import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse } from '../../../core/models/api.models';
import { SecuritiesDomainItem, SecuritiesDomainSearchParams } from './securities-domain.models';

@Injectable({ providedIn: 'root' })
export class SecuritiesDomainService {
  private apiUrl = '/api/securities-domains';

  constructor(private http: HttpClient) {}

  // Get paged securities domains with filters and sorting
  getPaging(params: SecuritiesDomainSearchParams): Observable<PagedResponse<SecuritiesDomainItem>> {
    const query: any = {
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
    };
    if (params.domainCode) query.DomainCode = params.domainCode;
    if (params.domainName) query.DomainName = params.domainName;
    if (params.isDefault !== undefined && params.isDefault !== null) query.IsDefault = params.isDefault;
    if (params.sortColumn) query.orderBy = params.sortColumn;
    if (params.sortDirection) query.sortBy = params.sortDirection;

    return this.http.get<PagedResponse<SecuritiesDomainItem>>(`${this.apiUrl}/paging`, { params: query });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepositMemberItem, DepositMemberSearchParams, PagedResponse } from './deposit-member.models';

@Injectable({ providedIn: 'root' })
export class DepositMemberService {
  private apiUrl = '/api/deposit-members';

  constructor(private http: HttpClient) {}

  getPaging(params: DepositMemberSearchParams): Observable<PagedResponse<DepositMemberItem>> {
    // Map to backend expected param names (DepositCode, ShortName, FullName)
    const query: any = {
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
    };
    if (params.depositCode) query.DepositCode = params.depositCode;
    if (params.shortName) query.ShortName = params.shortName;
    if (params.fullName) query.FullName = params.fullName;
    if (params.sortColumn) query.SortColumn = params.sortColumn;
    if (params.sortDirection) query.SortDirection = params.sortDirection;

    return this.http.get<PagedResponse<DepositMemberItem>>(`${this.apiUrl}/paging`, { params: query });
  }
}

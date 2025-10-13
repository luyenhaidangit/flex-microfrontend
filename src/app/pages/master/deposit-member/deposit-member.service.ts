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
    if (params.bicCode) query.BicCode = params.bicCode;
    // Backend prefers camelCase: orderBy, sortBy
    if (params.sortColumn) query.orderBy = params.sortColumn;
    if (params.sortDirection) query.sortBy = params.sortDirection;

    return this.http.get<PagedResponse<DepositMemberItem>>(`${this.apiUrl}/paging`, { params: query });
  }

  // Import deposit members via CSV upload
  importDepositMembers(formData: FormData) {
    // The backend endpoint for import
    const url = '/api/depositmember/import';
    return this.http.post<any>(url, formData);
  }

  // Get import history (stub endpoint name; adjust to backend)
  getImportHistory() {
    const url = '/api/depositmember/imports';
    return this.http.get<any[]>(url);
  }

  // Get preview details for an uploaded file
  getImportPreview(id: string) {
    const url = `/api/depositmember/imports/${encodeURIComponent(id)}/preview`;
    return this.http.get<any>(url);
  }
}

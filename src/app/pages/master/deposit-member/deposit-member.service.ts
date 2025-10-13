import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepositMemberItem, DepositMemberSearchParams } from './deposit-member.models';
import { PagedResponse } from '../../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class DepositMemberService {
  private apiUrl = '/api/deposit-members';
  
  constructor(private http: HttpClient) {}
  
  // Get paged deposit members with filters and sorting
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
  
  // Download sample template for import
  downloadImportTemplate() {
    return this.http.get(`${this.apiUrl}/template`, { responseType: 'blob', observe: 'response' });
  }
  
  // Import deposit members via CSV upload
  importDepositMembers(formData: FormData) {
    return this.http.post<any>(`${this.apiUrl}/stage`, formData);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DepositMemberItem, DepositMemberSearchParams, StagedFileInfo } from './deposit-member.models';
import { PagedResponse } from '../../../core/models/api.models';
import { Header } from '../../../core/enums/http.enum';

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
  
  // Create a request for deposit member import (replaces direct stage API)
  createImportRequest(formData: FormData) {
    return this.http.post<{ data: { requestId: number } }>(`${this.apiUrl}/requests`, formData, {
      headers: {
        [Header.SkipToastError]: 'true'
      }
    });
  }

  // Get staged file information
  getStagedFile(): Observable<StagedFileInfo | null> {
    return this.http.get<any>(`${this.apiUrl}/staged-file`).pipe(
      map(response => response.data)
    );
  }

  // Approve a pending import request
  approveRequest(id: number) {
    return this.http.post(`${this.apiUrl}/requests/${id}/approve`, null);
  }

  // Reject a pending import request with a reason
  rejectRequest(id: number, reason: string) {
    // Backend expects a raw JSON string body (e.g., "\"reason\"")
    return this.http.post(`${this.apiUrl}/requests/${id}/reject`, JSON.stringify(reason), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

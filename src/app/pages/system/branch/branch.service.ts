import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private apiUrl = '/api/branches';

  constructor(private http: HttpClient) {}

  // Get all approved branches with pagination
  getApprovedBranches(params: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Get approved branch detail by code
  getApprovedBranchByCode(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${code}`);
  }

  // New method to fetch change history separately
  getBranchChangeHistory(branchCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchCode}/history`);
  }

  // createBranch and updateBranch accept status, requestedBy, requestedDate, rejectReason for draft/save/submit/reject flows
  createBranch(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }

  // Create update branch request
  createUpdateBranchRequest(code: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${code}`, data);
  }

  // Create delete branch request
  createDeleteBranchRequest(code: string, data: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${code}`, { body: data });
  }

  // Get all pending branches with pagination
  getPendingBranches(params: any): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/pending', { params });
  }

  // New method to get branch request details for comparison
  getBranchRequestDetail(requestId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pending/${requestId}`);
  }

  getAllBranches(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl, {
      params: { pageIndex: 1, pageSize: 1000 }
    }).pipe(map(res => res?.data?.items ?? []));
  }

  updateBranch(code: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${code}`, data);
  }

  deleteBranch(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${code}`);
  }

  approveBranch(requestId: string | number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pending/${requestId}/approve`, {});
  }

  rejectBranch(requestId: string | number, reason: string): Observable<any> {
    // Gửi reason đúng dạng object { reason: string } theo API mới
    return this.http.post<any>(`${this.apiUrl}/pending/${requestId}/reject`, { reason });
  }

  cancelDraftRequest(requestId: number): Observable<any> {
    return this.http.post<any>(`/api/branches/requests/${requestId}/cancel`, {});
  }
}

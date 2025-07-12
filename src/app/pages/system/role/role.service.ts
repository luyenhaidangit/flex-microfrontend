import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = '/api/roles';

  constructor(private http: HttpClient) {}


  getRoles(params: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  getRoleDetail(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${code}`);
  }

  // New method to get role request details for comparison
  getRoleRequestDetail(requestId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/role-requests/${requestId}`);
  }

  getAllRoles(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl, {
      params: { pageIndex: 1, pageSize: 1000 }
    }).pipe(map(res => res?.data?.items ?? []));
  }

  // createRole and updateRole accept status, requestedBy, requestedDate, rejectReason for draft/save/submit/reject flows
  createRole(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateRole(code: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${code}`, data);
  }

  deleteRole(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${code}`);
  }

  approveRole(requestId: string | number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/requests/${requestId}/approve`, {});
  }

  rejectRole(requestId: string | number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/requests/${requestId}/reject`, { reason });
  }

  saveDraftRole(data: any) {
    return this.http.post<any>('/api/roles/requests/create', data);
  }

  cancelDraftRequest(requestId: number): Observable<any> {
    return this.http.post<any>(`/api/roles/requests/${requestId}/cancel`, {});
  }
}

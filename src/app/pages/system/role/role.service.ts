import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Header } from 'src/app/core/enums/http.enum';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = '/api/roles';

  constructor(private http: HttpClient) {}

  // Get all approved roles with pagination
  getApprovedRoles(params: any): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/approved', { params });
  }

  // Get approved role detail by code
  getApprovedRoleByCode(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/approved/${code}`);
  }

  // New method to fetch change history separately
  getRoleChangeHistory(roleCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/approved/${roleCode}/history`);
  }

  // createRole and updateRole accept status, requestedBy, requestedDate, rejectReason for draft/save/submit/reject flows
  createRole(data: any): Observable<any> {
    const headers = new HttpHeaders().set(Header.SkipToastError, 'true');
    return this.http.post<any>(`${this.apiUrl}/requests/create`, data, { headers });
  }

  // Create update role request
  createUpdateRoleRequest(code: string, data: any): Observable<any> {
    const headers = new HttpHeaders().set(Header.SkipToastError, 'true');
    return this.http.post<any>(`${this.apiUrl}/approved/${code}/update`, data, { headers });
  }

  // Create delete role request
  createDeleteRoleRequest(code: string, data: any): Observable<any> {
    const headers = new HttpHeaders().set(Header.SkipToastError, 'true');
    return this.http.post<any>(`${this.apiUrl}/approved/${code}/delete`, data, { headers });
  }

  // Get all pending roles with pagination
  getPendingRoles(params: any): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/pending', { params });
  }

  // New method to get role request details for comparison
  getRoleRequestDetail(requestId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pending/${requestId}`);
  }

  getAllRoles(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl, {
      params: { pageIndex: 1, pageSize: 1000 }
    }).pipe(map(res => res?.data?.items ?? []));
  }

  updateRole(code: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${code}`, data);
  }

  deleteRole(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${code}`);
  }

  approveRole(requestId: string | number): Observable<any> {
    const headers = new HttpHeaders().set(Header.SkipToastError, 'true');
    return this.http.post<any>(`${this.apiUrl}/pending/${requestId}/approve`, {}, { headers });
  }

  rejectRole(requestId: string | number, reason: string): Observable<any> {
    // Gửi reason đúng dạng object { reason: string } theo API mới
    const headers = new HttpHeaders().set(Header.SkipToastError, 'true');
    return this.http.post<any>(`${this.apiUrl}/pending/${requestId}/reject`, { reason }, { headers });
  }

  cancelDraftRequest(requestId: number): Observable<any> {
    return this.http.post<any>(`/api/roles/requests/${requestId}/cancel`, {});
  }

  getTreePermissions(code?: string): Observable<any> {
    if (code) {
      return this.http.get<any>(`${this.apiUrl}/tree-permissions`, { params: { code } });
    }
    return this.http.get<any>(`${this.apiUrl}/tree-permissions`);
  }
}

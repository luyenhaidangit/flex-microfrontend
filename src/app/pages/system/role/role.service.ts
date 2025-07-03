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

  approveRole(code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${code}/approve`, {});
  }

  rejectRole(code: string, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${code}/reject`, { reason });
  }

  saveDraftRole(data: any) {
    return this.http.post<any>('/api/roles/requests/create', data);
  }
}

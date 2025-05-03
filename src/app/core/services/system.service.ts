import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class SystemService {
  constructor(private http: HttpClient) { }

  // Department
  getDepartmentPaging(params: any): Observable<any> {
    return this.http.get('/api/department/get-department-paging', { params });
  }

  // Branch
  getBranchesPaging(req: any): Observable<any> {
    return this.http.get<any>('/api/branch/get-branches-paging', { params: req as any });
  }

  createBranchRequest(payload: any): Observable<any> {
    return this.http.post('/api/branch/create-branch-request', payload);
  }

  approveBranchRequest(requestId: number): Observable<any> {
    return this.http.post(`/api/branch/approve-branch-request`, { requestId });
  }

  rejectBranchRequest(requestId: number, comment: string): Observable<any> {
    return this.http.post(`/api/branch/reject-branch-request`, { requestId, comment });
  }

  updateBranchRequest(payload: any): Observable<any> {
    return this.http.post(`/api/branch/update-branch-request`, payload);
  }

  approveBranchEditRequest(requestId: number): Observable<any> {
    return this.http.post(`/api/branch/approve-update-request`, { requestId });
  }

  rejectBranchEditRequest(requestId: number, comment: string): Observable<any> {
    return this.http.post(`/api/branch/reject-update-request`, { requestId, comment });
  }

  getPendingUpdateRequest(code: string): Observable<any> {
    return this.http.get('/api/branch/get-pending-update-request', {
      params: { code }
    });
  }

  deleteBranchRequest(payload: {code: string, name: string, address?: string}): Observable<any> {
    return this.http.post(`/api/branch/delete-branch-request`, payload);
  }

  approveBranchDeleteRequest(requestId: number): Observable<any> {
    return this.http.post(`/api/branch/approve-delete-request`, { requestId });
  }

  rejectBranchDeleteRequest(requestId: number, comment: string): Observable<any> {
    return this.http.post(`/api/branch/reject-delete-request`, { requestId, comment });
  }
}

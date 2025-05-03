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
}

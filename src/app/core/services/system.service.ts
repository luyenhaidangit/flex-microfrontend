import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class SystemService {
  constructor(private http: HttpClient) { }

  // Department module was removed

  // Branch
  getBranchesPaging(req: any): Observable<any> {
    return this.http.get<any>('/api/branch/get-branches-paging', { params: req as any });
  }

  // Thay thế các API riêng lẻ bằng một method chung
  processBranchRequest(payload: {
    id: number, 
    isApprove: boolean,
    actionType?: string,
    comment?: string
  }): Observable<any> {
    return this.http.post('/api/branch/process-branch-request', payload);
  }

  // Giữ lại các API tạo request và lấy thông tin
  createBranchRequest(payload: any): Observable<any> {
    return this.http.post('/api/branch/request', {
      ...payload,
      requestType: 'CREATE'
    });
  }

  updateBranchRequest(payload: any): Observable<any> {
    return this.http.post('/api/branch/request', {
      ...payload,
      requestType: 'UPDATE'
    });
  }

  deleteBranchRequest(payload: {code: string, name: string, address?: string}): Observable<any> {
    return this.http.post('/api/branch/request', {
      ...payload,
      requestType: 'DELETE'
    });
  }

  // Giữ lại API get pending update
  getPendingUpdateRequest(code: string): Observable<any> {
    return this.http.get('/api/branch/get-pending-update-request', {
      params: { code }
    });
  }
}

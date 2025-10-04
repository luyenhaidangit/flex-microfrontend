import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private readonly baseUrl = '/api/workflow';

  constructor(private http: HttpClient) {}

  // ===== Query APIs =====
  getDefinitions(params: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/definitions`, { params });
  }

  getDefinitionByCode(code: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/definitions/${encodeURIComponent(code)}`);
  }

  getPendingRequests(params: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/requests/pending`, { params });
  }

  getPendingRequestById(requestId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/requests/pending/${requestId}`);
  }

  // ===== Command APIs =====
  createDraft(dto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/definitions`, dto);
  }

  updateDraft(code: string, dto: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/definitions/${encodeURIComponent(code)}`, dto);
  }

  // Overloads to satisfy different call signatures
  requestPublish(code: string, version: number, body: any): Observable<any>;
  requestPublish(code: string, body?: any): Observable<any>;
  requestPublish(code: string, arg2?: any, arg3?: any): Observable<any> {
    // If second argument is a number, treat it as version (compat)
    if (typeof arg2 === 'number') {
      const version = arg2 as number;
      const body = arg3 || {};
      // Default to same endpoint; version can be included in body for backend compatibility
      const payload = { version, ...body };
      return this.http.post<any>(`${this.baseUrl}/definitions/${encodeURIComponent(code)}/publish`, payload);
    }
    const body = arg2 || {};
    return this.http.post<any>(`${this.baseUrl}/definitions/${encodeURIComponent(code)}/publish`, body);
  }

  approvePending(requestId: number, body?: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requests/pending/${requestId}/approve`, body || {});
  }

  rejectPending(requestId: number, body?: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requests/pending/${requestId}/reject`, body || {});
  }
}



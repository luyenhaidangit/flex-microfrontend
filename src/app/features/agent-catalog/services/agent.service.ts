import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../models/agent.model';

interface ApiResult<T> {
  isSuccess: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  private apiUrl = `${environment.apiBaseUrl}/api/v1/agents`;

  constructor(private http: HttpClient) {}

  getAgents(): Observable<Agent[]> {
    return this.http.get<ApiResult<Agent[]>>(this.apiUrl).pipe(map(res => res.data));
  }

  getAgentById(id: string): Observable<Agent> {
    return this.http.get<ApiResult<Agent>>(`${this.apiUrl}/${id}`).pipe(map(res => res.data));
  }

  createAgent(request: CreateAgentRequest): Observable<Agent> {
    return this.http.post<ApiResult<Agent>>(this.apiUrl, request).pipe(map(res => res.data));
  }

  updateAgent(id: string, request: UpdateAgentRequest): Observable<Agent> {
    return this.http.put<ApiResult<Agent>>(`${this.apiUrl}/${id}`, request).pipe(map(res => res.data));
  }

  deleteAgent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

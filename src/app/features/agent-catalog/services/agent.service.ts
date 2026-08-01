import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private apiUrl = `${environment.apiBaseUrl}/api/v1/agents`;

  constructor(private http: HttpClient) {}

  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.apiUrl);
  }

  getAgentById(id: string): Observable<Agent> {
    return this.http.get<Agent>(`${this.apiUrl}/${id}`);
  }

  createAgent(request: CreateAgentRequest): Observable<Agent> {
    return this.http.post<Agent>(this.apiUrl, request);
  }

  updateAgent(id: string, request: UpdateAgentRequest): Observable<Agent> {
    return this.http.put<Agent>(`${this.apiUrl}/${id}`, request);
  }

  deleteAgent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AgentChatRequest, AgentChatResponse } from '../models/agent-chat.model';

@Injectable({ providedIn: 'root' })
export class AgentChatService {
  constructor(private readonly http: HttpClient) {}

  chat(request: AgentChatRequest): Observable<AgentChatResponse> {
    return this.http.post<AgentChatResponse>(`${environment.apiBaseUrl}/api/v1/ai/chat`, request);
  }
}

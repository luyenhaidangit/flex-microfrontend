import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AgentPreviewRequest, AgentPreviewResponse } from '../models/agent-preview.model';

@Injectable({ providedIn: 'root' })
export class AgentPreviewService {
  constructor(private readonly http: HttpClient) {}
  preview(request: AgentPreviewRequest): Observable<AgentPreviewResponse> {
    return this.http.post<AgentPreviewResponse>(`${environment.apiBaseUrl}/api/v1/ai/chat/preview`, request);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Conversation,
  ConversationMessage,
  CreateConversationRequest,
  CreateMessageRequest,
} from './conversation.models';

@Injectable({ providedIn: 'root' })
export class ConversationApiService {
  private readonly baseUrl = `${environment.agentApiBaseUrl.replace(/\/+$/, '')}/api/v1/conversations`;

  constructor(private readonly http: HttpClient) {}

  create(request: CreateConversationRequest = {}): Observable<Conversation> {
    return this.http.post<Conversation>(this.baseUrl, request);
  }

  list(limit = 50): Observable<Conversation[]> {
    const params = new HttpParams().set('limit', Math.min(Math.max(limit, 1), 50));
    return this.http.get<Conversation[]>(this.baseUrl, { params });
  }

  getMessages(conversationId: string, limit = 50, beforeSequenceNo?: number): Observable<ConversationMessage[]> {
    let params = new HttpParams().set('limit', Math.min(Math.max(limit, 1), 50));
    if (beforeSequenceNo !== undefined) params = params.set('beforeSequenceNo', beforeSequenceNo);
    return this.http.get<ConversationMessage[]>(`${this.baseUrl}/${conversationId}/messages`, { params });
  }

  append(conversationId: string, request: CreateMessageRequest): Observable<ConversationMessage> {
    return this.http.post<ConversationMessage>(`${this.baseUrl}/${conversationId}/messages`, request);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
	private apiUrl = '/api/users';

	constructor(private http: HttpClient) {}

	getUsers(params: any): Observable<any> {
		return this.http.get<any>(this.apiUrl, { params });
	}

	/**
	 * Get user detail by ID
	 */
	getUserById(id: number): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Get pending user requests with pagination
	 */
	getPendingUserRequests(params: any): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/requests/pending`, { params });
	}

	/**
	 * Get pending user request detail by ID
	 */
	getPendingUserRequestById(requestId: number): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/requests/pending/${requestId}`);
	}

	/**
	 * Approve pending user request
	 */
	approvePendingUserRequest(requestId: number, comment?: string): Observable<any> {
		const body = comment ? { comment } : {};
		return this.http.post<any>(`${this.apiUrl}/requests/pending/${requestId}/approve`, body);
	}

	/**
	 * Reject pending user request
	 */
	rejectPendingUserRequest(requestId: number, reason?: string): Observable<any> {
		const body = reason ? { reason } : {};
		return this.http.post<any>(`${this.apiUrl}/requests/pending/${requestId}/reject`, body);
	}

	/**
	 * Get user change history
	 */
	getUserChangeHistory(userId: number): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/${userId}/history`);
	}
}



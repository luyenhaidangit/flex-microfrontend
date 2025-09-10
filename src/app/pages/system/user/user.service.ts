import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
	private apiUrl = '/api/users';
	
	constructor(private http: HttpClient) {}
	
	// ===== Query APIs =====
	
	/**
	* Get all approved users with pagination
	*/
	getUsers(params: any): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/approved`, { params });
	}
	
	/**
	* Get approved user by username
	*/
	getUserByUsername(username: string): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/approved/${username}`);
	}
	
	/**
	* Get approved user change history by username
	*/
	getUserChangeHistory(username: string): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/approved/${username}/history`);
	}
	
	/**
	* Get all pending user requests with pagination
	*/
	getPendingUserRequests(params: any): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/request/pending`, { params });
	}
	
	/**
	* Get pending user request detail by ID
	*/
	getPendingUserRequestById(requestId: number): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/request/pending/${requestId}`);
	}
	
	// ===== Command APIs =====
	
	/**
	* Create a new user request
	*/
	createUser(dto: any): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/request/create`, dto);
	}
	
	/**
	* Create a new user request (alias for createUser)
	*/
	createUserRequest(dto: any): Observable<any> {
		return this.createUser(dto);
	}
	
	/**
	* Create update user request
	*/
	updateUserRequest(request: any): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/request/update`, request);
	}
	
	/**
	* Create delete user request
	*/
	deleteUserRequest(username: string): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/request/delete/${username}`, {});
	}
	
	/**
	* Approve pending user request by ID
	*/
	approvePendingUserRequest(requestId: number, comment?: string): Observable<any> {
		const body = comment ? { comment } : {};
		return this.http.post<any>(`${this.apiUrl}/request/pending/${requestId}/approve`, body);
	}
	
	/**
	* Reject pending user request by ID
	*/
	rejectPendingUserRequest(requestId: number, reason?: string): Observable<any> {
		const body = reason ? { reason } : {};
		return this.http.post<any>(`${this.apiUrl}/request/pending/${requestId}/reject`, body);
	}
}



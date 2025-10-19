import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IssuerService {
	private apiUrl = '/api/issuers';
	
	constructor(private http: HttpClient) {}
	
	// ===== Query APIs =====
	
	/**
	* Get all approved users with pagination
	*/
	getIssuers(params: any): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/approved`, { params });
	}
	
	/**
	* Get approved user by username
	*/
	getIssuerByCode(code: string): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/approved/${code}`);
	}
	
	/**
	* Get approved user change history by username
	*/
	getIssuerChangeHistory(code: string): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/approved/${code}/history`);
	}
	
	/**
	* Get all pending user requests with pagination
	*/
	getPendingIssuerRequests(params: any): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/request/pending`, { params });
	}
	
	/**
	* Get pending user request detail by ID
	*/
	getPendingIssuerRequestById(requestId: number): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/request/pending/${requestId}`);
	}
	
	// ===== Command APIs =====
	
	/**
	* Create a new user request
	*/
	createIssuer(dto: any): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/request/create`, dto);
	}
	
	/**
	* Create a new user request (alias for createUser)
	*/
	createIssuerRequest(dto: any): Observable<any> {
		return this.createIssuer(dto);
	}
	
	/**
	* Create update user request
	*/
	updateIssuerRequest(request: any): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/request/update`, request);
	}
	
	/**
	* Create delete user request
	*/
	deleteIssuerRequest(code: string): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/request/delete/${code}`, {});
	}
	
	/**
	* Create delete user request
	*/
	createDeleteIssuerRequest(code: string): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/request/delete/${code}`, {});
	}
	
	/**
	* Approve pending user request by ID
	*/
	approvePendingIssuerRequest(requestId: number, comment?: string): Observable<any> {
		const body = comment ? { comment } : {};
		return this.http.post<any>(`${this.apiUrl}/request/pending/${requestId}/approve`, body);
	}
	
	/**
	* Reject pending user request by ID
	*/
	rejectPendingIssuerRequest(requestId: number, reason?: string): Observable<any> {
		const body = reason ? { reason } : {};
		return this.http.post<any>(`${this.apiUrl}/request/pending/${requestId}/reject`, body);
	}
}

// Backwards-compatible alias so existing imports of UserService keep working
export { IssuerService as UserService };



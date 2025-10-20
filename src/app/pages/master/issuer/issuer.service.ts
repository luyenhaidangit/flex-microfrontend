import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IssuerService {
	private apiUrl = '/api/issuers';
	
	constructor(private http: HttpClient) {}
	
	// ===== Query APIs =====
	
	/**
	* Get all approved issuers with pagination
	*/
	getIssuers(params: any): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/approved`, { params });
	}
	
	/**
	* Get approved issuer by id
	*/
	getIssuerById(id: number): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/approved/${id}`);
	}
	
	/**
	* Get all pending issuer requests with pagination
	*/
	getPendingIssuerRequests(params: any): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/requests/pending`, { params });
	}
	
	/**
	* Get pending issuer request detail by ID
	*/
	getPendingIssuerRequestById(requestId: number): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/requests/${requestId}`);
	}
	
	// ===== Command APIs =====
	
	/**
	* Create a new issuer request
	*/
	createIssuer(dto: any): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/requests/create`, dto);
	}
	
	/**
	* Create a new issuer request (alias)
	*/
	createIssuerRequest(dto: any): Observable<any> {
		return this.createIssuer(dto);
	}
	
	/**
	* Create update issuer request
	*/
	updateIssuerRequest(issuerId: string, request: any): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/${issuerId}/requests/update`, request);
	}
	
	/**
	* Create delete issuer request
	*/
	deleteIssuerRequest(issuerId: string): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/${issuerId}/requests/delete`, {});
	}
	
	/**
	* Create delete issuer request (alias)
	*/
	createDeleteIssuerRequest(issuerId: string): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/${issuerId}/requests/delete`, {});
	}
	
	/**
	* Approve pending issuer request by ID
	*/
	approvePendingIssuerRequest(requestId: number, comment?: string): Observable<any> {
		const body = comment ? { comment } : {};
		return this.http.post<any>(`${this.apiUrl}/requests/${requestId}/approve`, body);
	}
	
	/**
	* Reject pending issuer request by ID
	*/
	rejectPendingIssuerRequest(requestId: number, reason?: string): Observable<any> {
		const body = reason ? { reason } : {};
		return this.http.post<any>(`${this.apiUrl}/requests/${requestId}/reject`, body);
	}
}

// Backwards-compatible alias so existing imports of UserService keep working
export { IssuerService as UserService };



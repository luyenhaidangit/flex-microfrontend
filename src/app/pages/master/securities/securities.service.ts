import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SecuritiesSearchParams } from './securities.models';

@Injectable({ providedIn: 'root' })
export class SecuritiesService {
	private apiUrl = '/api/securities';
	
	constructor(private http: HttpClient) {}
	
	/**
	 * Get all securities with pagination
	 */
	getPaging(params: SecuritiesSearchParams): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/paging`, { params });
	}
}

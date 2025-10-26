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
		const query: any = {
			pageIndex: params.pageIndex,
			pageSize: params.pageSize,
		};
		if (params.securitiesCode) query.securitiesCode = params.securitiesCode;
		if (params.orderBy) query.orderBy = params.orderBy;
		if (params.sortBy) query.sortBy = params.sortBy;

		return this.http.get<any>(`${this.apiUrl}/paging`, { params: query });
	}

	/**
	 * Get securities by code
	 */
	getByCode(securitiesCode: string): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/${securitiesCode}`);
	}
}

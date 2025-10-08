import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SecuritiesDomainService {
  private apiUrl = '/api/securities/domains';

  constructor(private http: HttpClient) {}

  getDomains(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}

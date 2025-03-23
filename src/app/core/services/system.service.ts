import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class SystemService {
  constructor(private http: HttpClient) { }

  // Department
  getDepartmentPaging(params: any): Observable<any> {
    return this.http.get('/api/department/get-department-paging', { params });
  }
}

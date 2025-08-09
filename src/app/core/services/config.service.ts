import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {

  URL = environment.externalService.configServiceUrl;
  constructor(private http: HttpClient) { }

  getConfig() : Observable<any> {
    return this.http.get<any>(`${this.URL}`)
  }

  // Get auth mode from backend
  getAuthConfig(): Observable<any> {
    return this.http.get(`/api/config/get-auth-mode`);
  }
}

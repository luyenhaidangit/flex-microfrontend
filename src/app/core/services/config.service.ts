import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {

  private apiUrl = environment.flexServer.apiUrl;
  URL = environment.externalService.configServiceUrl;

  constructor(private http: HttpClient) { }
  getConfig() : Observable<any> {
    return this.http.get<any>(`${this.URL}`)
  }

  getConfigByKey(key: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/config/get-config-by-key?key=${key}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { tap, mapTo, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CONFIG_KEYS } from '../constants/config-key.constant';
import { ErrorPageService } from './error-page.service';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {

  URL = environment.externalService.configServiceUrl;

  constructor(private http: HttpClient, private errorPageService: ErrorPageService) { }

  // Config data
  public authMode: string = null;

  getConfig() : Observable<any> {
    return this.http.get<any>(`${this.URL}`)
  }

  getConfigByKey(key: string): Observable<any> {
    return this.http.get(`/api/config/get-config-by-key?key=${key}`);
  }

  /**
   * Lấy cấu hình AuthMode Loại xác thực.
   */
  loadAuthMode(): Observable<void> {
    return this.getConfigByKey(CONFIG_KEYS.AUTH_MODE).pipe(
      tap(response => {
        if (response && response.isSuccess && response.data) {
          this.authMode = response.data;
        }
      }),
      mapTo(void 0),
      catchError(err => {
        this.errorPageService.navigateToErrorPage('Máy chủ gặp sự cố, vui lòng thử lại sau!', 500, false);
        console.error('Error loading AuthMode:', err);
        return of(void 0);
      })
    );
  }
}

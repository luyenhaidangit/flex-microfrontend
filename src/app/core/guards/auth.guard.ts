import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AuthenticationService } from '../services/auth.service';
import { AuthfakeauthenticationService } from '../services/authfake.service';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../services/config.service';
import { AUTH_MODE } from '../constants/config-values.constant';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private configService: ConfigService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    if (this.configService.authMode === AUTH_MODE.DB) {
      const currentUser = this.authenticationService.GetCurrentUser();

      // Refresh user info if current user is null
      if (!currentUser) {
        return this.authenticationService.GetUserProfile().pipe(
          map((response: any) => {
            if (response?.isSuccess) {
              this.authenticationService.SetCurrentUser(response?.data);
              return true;
            } else {
              this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
              return false; 
            }
          }),
          catchError(() => {
            this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
            return of(false);
          })
        );
      }

      return of(true);
    }

    this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
    return of(false);
  }
}

import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthenticationService } from '../services/auth.service';

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
      const token = this.authenticationService.getToken();
      if (token) return of(true);

      // No token → redirect to login
      this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    }

    this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
    return of(false);
  }
}

import { Injectable, Injector } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';

import { AuthenticationService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { ConfigService } from '../services/config.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private configService: ConfigService,
    private injector: Injector
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const token = this.authenticationService.getToken();
    if (token) return of(true);

    this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
    return of(false);
  }
}


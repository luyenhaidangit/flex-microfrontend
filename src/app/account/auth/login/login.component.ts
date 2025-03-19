import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { ToastService } from 'angular-toastify';

import { AuthenticationService } from '../../../core/services/auth.service';
import { AUTH_MODE } from 'src/app/core/constants/config-values.constant';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted:any = false;
  error:any = '';
  returnUrl: string;
  passwordFieldType: string = 'password';

  authMode: string = AUTH_MODE.DB;

  // Set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router, 
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      userName: ['admin', [Validators.required]],
      password: ['Haidang106@', [Validators.required]],
      rememberMe: [true] 
    });

    // Reset login status
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } 
    
    if (this.authMode === AUTH_MODE.DB) {
      var isRemember = this.f.rememberMe.value;

      this.authenticationService.login(this.f.userName.value, this.f.password.value,isRemember)
        .subscribe(
        (response: any) => {
          if(response?.isSuccess){
            const accessToken = response?.data?.accessToken;

            this.authenticationService.setAuthToken({ accessToken },isRemember);
            this.toastService.success('Đăng nhập thành công!');
            this.router.navigate(['/dashboard']);
          }
        },
        (failure: any) => {
          this.toastService.error(failure?.error?.message);
        }
    )};
  }

  // UI
  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}

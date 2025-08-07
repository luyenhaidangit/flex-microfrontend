import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface AuthMode {
  value: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {
  
  authForm: FormGroup;
  isLoading = false;
  
  authModes: AuthMode[] = [
    {
      value: 'database',
      label: 'Database Authentication',
      description: 'Use local database for user authentication'
    },
    {
      value: 'ldap',
      label: 'LDAP Authentication',
      description: 'Use LDAP/Active Directory for authentication'
    },
    {
      value: 'oauth',
      label: 'OAuth 2.0',
      description: 'Use OAuth 2.0 providers (Google, Facebook, etc.)'
    },
    {
      value: 'saml',
      label: 'SAML 2.0',
      description: 'Use SAML 2.0 for enterprise SSO'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.authForm = this.fb.group({
      authMode: ['database', Validators.required],
      enableRegistration: [true],
      requireEmailVerification: [true],
      enableTwoFactor: [false],
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      lockoutDuration: [15, [Validators.required, Validators.min(1), Validators.max(60)]],
      
      // Database settings
      dbConnectionString: [''],
      dbProvider: ['sqlserver'],
      
      // LDAP settings
      ldapServer: [''],
      ldapPort: [389],
      ldapBaseDN: [''],
      ldapBindDN: [''],
      ldapBindPassword: [''],
      
      // OAuth settings
      oauthProviders: this.fb.group({
        google: [false],
        facebook: [false],
        github: [false],
        microsoft: [false]
      }),
      
      // Security settings
      passwordPolicy: this.fb.group({
        minLength: [8, [Validators.required, Validators.min(6), Validators.max(20)]],
        requireUppercase: [true],
        requireLowercase: [true],
        requireNumbers: [true],
        requireSpecialChars: [true],
        preventCommonPasswords: [true]
      })
    });
  }

  ngOnInit(): void {
    this.loadSettings();
    this.onAuthModeChange();
  }

  loadSettings(): void {
    // TODO: Load settings from API
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.authForm.patchValue({
        authMode: 'database',
        enableRegistration: true,
        requireEmailVerification: true,
        enableTwoFactor: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        dbConnectionString: 'Server=localhost;Database=FlexDB;Trusted_Connection=true;',
        dbProvider: 'sqlserver'
      });
      this.isLoading = false;
    }, 1000);
  }

  onAuthModeChange(): void {
    this.authForm.get('authMode')?.valueChanges.subscribe(mode => {
      // Reset form fields based on auth mode
      this.resetFormFields(mode);
    });
  }

  resetFormFields(mode: string): void {
    switch (mode) {
      case 'database':
        this.authForm.get('dbConnectionString')?.enable();
        this.authForm.get('dbProvider')?.enable();
        this.authForm.get('ldapServer')?.disable();
        this.authForm.get('ldapPort')?.disable();
        this.authForm.get('ldapBaseDN')?.disable();
        this.authForm.get('ldapBindDN')?.disable();
        this.authForm.get('ldapBindPassword')?.disable();
        break;
      case 'ldap':
        this.authForm.get('dbConnectionString')?.disable();
        this.authForm.get('dbProvider')?.disable();
        this.authForm.get('ldapServer')?.enable();
        this.authForm.get('ldapPort')?.enable();
        this.authForm.get('ldapBaseDN')?.enable();
        this.authForm.get('ldapBindDN')?.enable();
        this.authForm.get('ldapBindPassword')?.enable();
        break;
      case 'oauth':
        this.authForm.get('dbConnectionString')?.disable();
        this.authForm.get('dbProvider')?.disable();
        this.authForm.get('ldapServer')?.disable();
        this.authForm.get('ldapPort')?.disable();
        this.authForm.get('ldapBaseDN')?.disable();
        this.authForm.get('ldapBindDN')?.disable();
        this.authForm.get('ldapBindPassword')?.disable();
        break;
    }
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      this.isLoading = true;
      
      // TODO: Save settings to API
      setTimeout(() => {
        this.toastr.success('Authentication settings saved successfully!', 'Success');
        this.isLoading = false;
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.authForm.controls).forEach(key => {
      const control = this.authForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      }
    });
  }

  testConnection(): void {
    const authMode = this.authForm.get('authMode')?.value;
    
    if (authMode === 'database') {
      this.testDatabaseConnection();
    } else if (authMode === 'ldap') {
      this.testLdapConnection();
    }
  }

  testDatabaseConnection(): void {
    this.isLoading = true;
    
    // TODO: Test database connection
    setTimeout(() => {
      this.toastr.success('Database connection successful!', 'Connection Test');
      this.isLoading = false;
    }, 2000);
  }

  testLdapConnection(): void {
    this.isLoading = true;
    
    // TODO: Test LDAP connection
    setTimeout(() => {
      this.toastr.success('LDAP connection successful!', 'Connection Test');
      this.isLoading = false;
    }, 2000);
  }

  getSelectedAuthMode(): AuthMode | undefined {
    const mode = this.authForm.get('authMode')?.value;
    return this.authModes.find(m => m.value === mode);
  }
}

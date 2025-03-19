import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalStorage } from '../enums/local-storage.enum';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

    private user: any;

    constructor(private http: HttpClient,private router: Router) {
    }

    // Login
    public login(userName: string, password: string,rememberMe: boolean) {
        const body = {
            userName: userName,
            password: password,
            rememberMe: rememberMe
        };
      
        return this.http.post('/api/aspnet-identity/auth/login', body);
    }

    public logout() {
        this.removeAuthToken();
    }

    // Set AuthToken
    public setAuthToken(authToken: any, rememberMe: boolean) {
        const tokenString = JSON.stringify(authToken);
    
        if (rememberMe) {
            localStorage.setItem(LocalStorage.AuthToken, tokenString);
        } else {
            sessionStorage.setItem(LocalStorage.AuthToken, tokenString);
        }
    }
    

    // Get AuthToken
    public getAuthToken(): any {
        const tokenString = localStorage.getItem(LocalStorage.AuthToken) || sessionStorage.getItem(LocalStorage.AuthToken);
        if (tokenString) {
            return JSON.parse(tokenString);
        }
        return null;
    }

    // Delete AuthToken
    private removeAuthToken() {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    }

    // Get Current User
    public GetCurrentUser(): any {
        return this.user;
    }

    public SetCurrentUser(user: any): any {
        this.user = user;
    }

    // Get User Profile
    public GetUserProfile() { 
        return this.http.get('/api/aspnet-identity/auth/me');
    }
}


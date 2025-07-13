import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorage } from '../enums/local-storage.enum';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser$: Observable<any>;

    constructor(private http: HttpClient, private router: Router) {
        // Load user from localStorage/sessionStorage if available
        const token = this.getAuthToken();
        let user = null;
        if (token && token.user) {
            user = token.user;
        } else {
            try {
                const userStr = localStorage.getItem('currentUser');
                if (userStr) user = JSON.parse(userStr);
            } catch {}
        }
        this.currentUserSubject = new BehaviorSubject<any>(user);
        this.currentUser$ = this.currentUserSubject.asObservable();
    }

    // Login
    public login(userName: string, password: string, rememberMe: boolean) {
        const body = {
            userName: userName,
            password: password,
            rememberMe: rememberMe
        };
        return this.http.post('/api/auth/login', body);
    }

    public logout() {
        this.removeAuthToken();
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
    }

    // Set AuthToken
    public setAuthToken(authToken: any, rememberMe: boolean) {
        const tokenString = JSON.stringify(authToken);
        if (rememberMe) {
            localStorage.setItem(LocalStorage.AuthToken, tokenString);
        } else {
            sessionStorage.setItem(LocalStorage.AuthToken, tokenString);
        }
        // Nếu authToken có user, cập nhật luôn user hiện tại
        if (authToken && authToken.user) {
            this.setCurrentUser(authToken.user);
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

    // Get Current User (sync)
    public getCurrentUser(): any {
        return this.currentUserSubject.value;
    }

    // Set Current User
    public setCurrentUser(user: any): void {
        this.currentUserSubject.next(user);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    // Get User Profile
    public GetUserProfile() {
        return this.http.get('/api/auth/me');
    }
}


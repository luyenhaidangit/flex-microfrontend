import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ErrorPageService {
  private _visibleSubject = new BehaviorSubject<boolean>(false);
  public readonly visible$: Observable<boolean> = this._visibleSubject.asObservable();

  private _errorMessageSubject = new BehaviorSubject<string>('Lỗi máy chủ nội bộ!');
  public readonly errorMessage$: Observable<string> = this._errorMessageSubject.asObservable();

  constructor(private router: Router) { }

  /**
   * Hiển thị trang lỗi (overlay) nếu cần.
   */
  showErrorPage(message?: string): void {
    if (message) {
      this._errorMessageSubject.next(message);
    }
    this._visibleSubject.next(true);
  }

  /**
   * Ẩn trang lỗi.
   */
  hideErrorPage(resetMessage: boolean = true): void {
    this._visibleSubject.next(false);
    if (resetMessage) {
      this._errorMessageSubject.next('Lỗi máy chủ nội bộ!');
    }
  }

  /**
   * Cập nhật thông báo lỗi mà không ảnh hưởng đến trạng thái hiển thị.
   */
  updateErrorMessage(message: string): void {
    this._errorMessageSubject.next(message);
  }

  /**
   * Điều hướng đến trang lỗi với mã lỗi và thông báo tùy chỉnh.
   * Ví dụ, điều hướng tới /error/500.
   */
  navigateToErrorPage(message: string, code: number = 500): void {
    this._errorMessageSubject.next(message);
    this.router.navigate(['/error', code], { queryParams: { message }, skipLocationChange: true });
  }
}

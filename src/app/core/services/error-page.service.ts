import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ErrorPageService {
  private _errorMessageSubject = new BehaviorSubject<string>('Lỗi máy chủ nội bộ!');
  public readonly errorMessage$: Observable<string> = this._errorMessageSubject.asObservable();

  // Ẩn hiện nút điều hướng trang lỗi
  public statusCode: number = 500;
  public navigationEnabled: boolean = true;

  constructor(private router: Router) { }

  /**
   * Điều hướng đến trang lỗi với mã lỗi.
   * @param message Thông điệp lỗi. (bắt buộc)
   * @param statusCode Mã lỗi. (mặc định 500)
   * @param navigationEnabled Cho phép điều hướng. (mặc định true)
   * @param skipLocationChange Bỏ qua thay đổi vị trí. (mặc định true)
   */
  navigateToErrorPage(message: string,statusCode: number = 500,navigationEnabled: boolean = true,skipLocationChange: boolean = true): void {
    this._errorMessageSubject.next(message);
    this.statusCode = statusCode;
    this.navigationEnabled = navigationEnabled;
    this.router.navigate(['/error'], { skipLocationChange: skipLocationChange });
  }
}

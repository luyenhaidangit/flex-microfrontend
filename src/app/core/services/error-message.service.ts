import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {

  constructor(private translate: TranslateService) {}

  /**
   * Lấy thông báo lỗi từ errorCode hoặc fallback về message
   * @param error HttpErrorResponse hoặc object có errorCode/message
   * @returns Observable<string> - Thông báo lỗi đã được dịch
   */
  getErrorMessage(error: HttpErrorResponse | any): string {
    // Nếu có errorCode, ưu tiên sử dụng translation
    if (error?.error?.errorCode) {
      const errorKey = `ERRORS.${error.error.errorCode}`;
      const translatedMessage = this.translate.instant(errorKey);
      
      // Nếu translation tồn tại và khác với key, sử dụng translation
      if (translatedMessage !== errorKey) {
        return translatedMessage;
      }
    }

    // Fallback về message từ response
    if (error?.error?.message) {
      return error.error.message;
    }

    // Fallback về message từ error object
    if (error?.message) {
      return error.message;
    }

    // Fallback cuối cùng dựa trên status code
    return this.getDefaultErrorMessage(error);
  }

  /**
   * Lấy thông báo lỗi mặc định dựa trên status code
   * @param error HttpErrorResponse
   * @returns string - Thông báo lỗi mặc định
   */
  private getDefaultErrorMessage(error: HttpErrorResponse | any): string {
    if (!error || !error.status) {
      return this.translate.instant('ERRORS.UNKNOWN_ERROR');
    }

    switch (error.status) {
      case 0:
        return this.translate.instant('ERRORS.NETWORK_ERROR');
      case 400:
        return this.translate.instant('ERRORS.VALIDATION_FAILED');
      case 401:
        return this.translate.instant('ERRORS.UNAUTHORIZED');
      case 403:
        return this.translate.instant('ERRORS.FORBIDDEN');
      case 404:
        return this.translate.instant('ERRORS.NOT_FOUND');
      case 500:
        return this.translate.instant('ERRORS.INTERNAL_SERVER_ERROR');
      default:
        return this.translate.instant('ERRORS.UNKNOWN_ERROR');
    }
  }

  /**
   * Lấy thông báo lỗi dạng Observable (async)
   * @param error HttpErrorResponse hoặc object có errorCode/message
   * @returns Observable<string> - Thông báo lỗi đã được dịch
   */
  getErrorMessageAsync(error: HttpErrorResponse | any) {
    // Nếu có errorCode, ưu tiên sử dụng translation
    if (error?.error?.errorCode) {
      const errorKey = `ERRORS.${error.error.errorCode}`;
      return this.translate.get(errorKey);
    }

    // Fallback về message từ response
    if (error?.error?.message) {
      return Promise.resolve(error.error.message);
    }

    // Fallback về message từ error object
    if (error?.message) {
      return Promise.resolve(error.message);
    }

    // Fallback cuối cùng dựa trên status code
    return this.getDefaultErrorMessageAsync(error);
  }

  /**
   * Lấy thông báo lỗi mặc định dạng Observable dựa trên status code
   * @param error HttpErrorResponse
   * @returns Observable<string> - Thông báo lỗi mặc định
   */
  private getDefaultErrorMessageAsync(error: HttpErrorResponse | any) {
    if (!error || !error.status) {
      return this.translate.get('ERRORS.UNKNOWN_ERROR');
    }

    switch (error.status) {
      case 0:
        return this.translate.get('ERRORS.NETWORK_ERROR');
      case 400:
        return this.translate.get('ERRORS.VALIDATION_FAILED');
      case 401:
        return this.translate.get('ERRORS.UNAUTHORIZED');
      case 403:
        return this.translate.get('ERRORS.FORBIDDEN');
      case 404:
        return this.translate.get('ERRORS.NOT_FOUND');
      case 500:
        return this.translate.get('ERRORS.INTERNAL_SERVER_ERROR');
      default:
        return this.translate.get('ERRORS.UNKNOWN_ERROR');
    }
  }
}

# Error Handling với i18n Support

## Tổng quan

Hệ thống xử lý lỗi đã được cập nhật để hỗ trợ hiển thị thông báo lỗi đa ngôn ngữ dựa trên `errorCode` từ API response thay vì chỉ hiển thị `message`.

## Cấu trúc

### 1. ErrorMessageService
- **File**: `src/app/core/services/error-message.service.ts`
- **Chức năng**: Centralize việc xử lý error messages với i18n support
- **Fallback logic**: `errorCode` → `message` → `status code default`

### 2. HTTP Interceptor
- **File**: `src/app/core/interceptors/http.interceptor.ts`
- **Cập nhật**: Sử dụng `ErrorMessageService` để lấy thông báo lỗi đã được dịch

### 3. Translation Files
- **File**: `src/assets/i18n/vn.json`, `src/assets/i18n/en.json`
- **Section**: `ERRORS` - Chứa các error codes và thông báo tương ứng

## Cách sử dụng

### 1. Thêm Error Code mới

Thêm error code vào file translation:

```json
{
  "ERRORS": {
    "NEW_ERROR_CODE": "Thông báo lỗi tiếng Việt",
    "ANOTHER_ERROR": "Thông báo lỗi khác"
  }
}
```

### 2. API Response Format

API response nên có format:

```json
{
  "isSuccess": false,
  "message": "One or more validation failures have occurred.",
  "errorCode": "USER_REQUEST_EXISTS"
}
```

### 3. Error Handling Flow

1. **ErrorCode có sẵn**: Hiển thị thông báo đã dịch từ `ERRORS.{errorCode}`
2. **Fallback 1**: Nếu không có translation, hiển thị `error.message`
3. **Fallback 2**: Nếu không có message, hiển thị thông báo mặc định theo status code

## Error Codes hiện có

| Error Code | Tiếng Việt | English |
|------------|------------|---------|
| `USER_REQUEST_EXISTS` | Yêu cầu người dùng đã tồn tại | User request already exists |
| `VALIDATION_FAILED` | Dữ liệu không hợp lệ | Validation failed |
| `UNAUTHORIZED` | Không có quyền truy cập | Unauthorized access |
| `FORBIDDEN` | Bị cấm truy cập | Access forbidden |
| `NOT_FOUND` | Không tìm thấy dữ liệu | Data not found |
| `INTERNAL_SERVER_ERROR` | Lỗi máy chủ nội bộ | Internal server error |
| `NETWORK_ERROR` | Lỗi kết nối mạng | Network connection error |
| `CONNECTION_REFUSED` | Không thể kết nối đến máy chủ | Cannot connect to server |
| `UNKNOWN_ERROR` | Đã xảy ra lỗi không xác định | Unknown error occurred |

## Testing

Sử dụng file `test-error-handling.html` để test các trường hợp lỗi khác nhau:

1. Mở file trong browser
2. Click các button test để xem kết quả
3. Kiểm tra thông báo lỗi hiển thị đúng theo errorCode

## Lợi ích

1. **Đa ngôn ngữ**: Hỗ trợ hiển thị thông báo lỗi theo ngôn ngữ người dùng
2. **Centralized**: Tất cả error handling được quản lý tập trung
3. **Fallback**: Có cơ chế fallback khi không có translation
4. **Maintainable**: Dễ dàng thêm error code mới
5. **Consistent**: Đảm bảo thông báo lỗi nhất quán trong toàn bộ ứng dụng

## Migration Guide

Nếu có code cũ đang xử lý error messages trực tiếp:

**Trước:**
```typescript
const msg = error?.error?.message || error?.message || 'Đã xảy ra lỗi!';
this.toastService.error(msg);
```

**Sau:**
```typescript
const errorMessage = this.errorMessageService.getErrorMessage(error);
this.toastService.error(errorMessage);
```

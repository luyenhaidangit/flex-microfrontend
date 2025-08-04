# Authentication Flow

## Overview
Hệ thống sử dụng JWT (JSON Web Token) với cơ chế Access Token và Refresh Token để bảo mật API.

## Flow Chi Tiết

### 1. Đăng Nhập (Login)
```
User nhập credentials → FE gửi request đến /login → BE xác thực → BE trả về:
- AccessToken (thời gian sống ngắn: 15-30 phút)
- RefreshToken (thời gian sống dài: 7-30 ngày)
```

### 2. Lưu Trữ Token (Frontend)
```
FE nhận tokens:
- AccessToken → Lưu vào memory (this.accessToken = token)
- RefreshToken → Lưu vào LocalStorage hoặc HttpOnly Cookie
```

### 3. Sử Dụng AccessToken
```
Mỗi API call:
- FE tự động thêm Authorization header: "Bearer {accessToken}"
- BE validate AccessToken → Trả về response
```

### 4. Xử Lý Token Hết Hạn
```
Khi AccessToken hết hạn:
- BE trả về 401 Unauthorized
- FE catch error → Gọi /refresh endpoint với RefreshToken
- BE validate RefreshToken → Trả về AccessToken mới
- FE update AccessToken trong memory → Retry original request
```

### 5. Reload Page
```
Khi user reload page:
- AccessToken trong memory bị mất
- FE check RefreshToken có tồn tại không
- Nếu có → Gọi /refresh để lấy AccessToken mới → Set vào memory
- Nếu không → Redirect về login page
```

### 6. Logout
```
User logout:
- Clear AccessToken khỏi memory
- Clear RefreshToken khỏi LocalStorage/Cookie
- Redirect về login page
```

## Security Considerations

### AccessToken
- Thời gian sống ngắn (15-30 phút)
- Lưu trong memory để tránh XSS attack
- Tự động clear khi reload page

### RefreshToken
- Thời gian sống dài (7-30 ngày)
- Lưu trong HttpOnly Cookie (ưu tiên) hoặc LocalStorage
- Có thể revoke ở BE khi cần

### Error Handling
- 401 Unauthorized → Thử refresh token
- 403 Forbidden → Redirect login
- Network error → Retry với exponential backoff

## Implementation Notes

### Frontend
- Sử dụng HTTP Interceptor để tự động thêm token
- Implement retry mechanism cho failed requests
- Handle concurrent refresh requests

### Backend
- Validate token signature và expiration
- Implement token blacklist/whitelist
- Rate limiting cho refresh endpoint
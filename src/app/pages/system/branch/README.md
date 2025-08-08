# Branch Component

Component quản lý chi nhánh theo pattern mới với API approval workflow.

## Tính năng

### 1. Quản lý chi nhánh đã duyệt
- Hiển thị danh sách chi nhánh đã được phê duyệt
- Tìm kiếm theo từ khóa và trạng thái
- Phân trang
- Xem chi tiết chi nhánh
- Tạo yêu cầu cập nhật/xóa chi nhánh

### 2. Quản lý yêu cầu chờ duyệt
- Hiển thị danh sách yêu cầu chờ phê duyệt
- Lọc theo loại yêu cầu (CREATE/UPDATE/DELETE)
- Xem chi tiết yêu cầu với so sánh thay đổi
- Phê duyệt/từ chối yêu cầu

### 3. Modal chi tiết
- Modal xem chi tiết chi nhánh
- Modal tạo mới chi nhánh
- Modal cập nhật chi nhánh
- Modal xóa chi nhánh
- Modal phê duyệt/từ chối yêu cầu
- Modal chi tiết yêu cầu với so sánh thay đổi

## API Endpoints

### Approved Branches
- `GET /api/branches` - Lấy danh sách chi nhánh đã duyệt
- `GET /api/branches/{code}` - Lấy chi tiết chi nhánh theo mã
- `GET /api/branches/{code}/history` - Lấy lịch sử thay đổi

### Pending Branches
- `GET /api/branches/pending` - Lấy danh sách yêu cầu chờ duyệt
- `GET /api/branches/pending/{requestId}` - Lấy chi tiết yêu cầu
- `POST /api/branches/pending/{requestId}/approve` - Phê duyệt yêu cầu
- `POST /api/branches/pending/{requestId}/reject` - Từ chối yêu cầu

### Create/Update/Delete Requests
- `POST /api/branches` - Tạo yêu cầu tạo mới chi nhánh
- `PUT /api/branches/{code}` - Tạo yêu cầu cập nhật chi nhánh
- `DELETE /api/branches/{code}` - Tạo yêu cầu xóa chi nhánh

## Cấu trúc Files

```
branch/
├── branch.component.ts          # Component logic
├── branch.component.html        # Template
├── branch.component.scss        # Styles
├── branch.service.ts           # Service gọi API
├── branch.models.ts            # TypeScript interfaces
└── README.md                   # Hướng dẫn sử dụng
```

## Sử dụng

1. Import BranchService vào component cần sử dụng
2. Inject service vào constructor
3. Gọi các method tương ứng với API endpoints

## Dependencies

- Angular Reactive Forms
- ngx-bootstrap (Modal, Tabs, Pagination)
- angular-toastify (Notifications)
- Shared components (app-badge, app-skeleton, app-page-title)
- Shared pipes (safeField, prettyJson)
- Shared directives (appUpperNoSpace)

## Notes

- Component sử dụng pattern approval workflow với maker-checker
- Hỗ trợ đầy đủ CRUD operations với approval process
- Có loading states và error handling
- Responsive design cho mobile
- Validation forms với custom error messages

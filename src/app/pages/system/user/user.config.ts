import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';

export const USER_CONFIG = {

  // Breadcrumb configuration
  breadcrumb: {
    title: 'Quản lý người sử dụng',

    items: [
      { label: 'Quản trị hệ thống' },
      { label: 'Quản lý người sử dụng', active: true }
    ]
  },

  // Tab configuration
  tabs: {
    default: 'approved',
    items: [
      { id: 'approved', label: 'Đã duyệt', icon: 'bx bx-check-circle' },
      { id: 'pending', label: 'Chờ duyệt', icon: 'bx bx-time' }
    ]
  },

  // Pagination configuration
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: DEFAULT_PER_PAGE_OPTIONS
  },

  // Table configuration
  table: {
    columns: {
      approved: [
        { key: 'userName', label: 'Tài khoản', width: '120px' },
        { key: 'fullName', label: 'Họ tên', width: '150px' },
        { key: 'email', label: 'Email', width: '200px' },
        { key: 'branchName', label: 'Chi nhánh', width: '140px' },
        { key: 'isActive', label: 'Trạng thái', width: '100px' },
        { key: 'actions', label: 'Thao tác', width: '120px' }
      ]
    },
    skeleton: {
      approved: {
        rows: 8,
        columns: ['120px', '150px', '200px', '140px', '100px', '120px']
      }
    }
  },

  // Status configuration
  status: {
    locked: {
      true: { text: 'Đã khóa', class: 'bg-danger', icon: 'lock' },
      false: { text: 'Hoạt động', class: 'bg-success', icon: 'unlock' }
    }
  },

  // Search options
  search: {
    branchOptions: [
      { label: 'Tất cả chi nhánh', value: null }
    ],
    lockStatusOptions: [
      { label: 'Tất cả', value: null },
      { label: 'Hoạt động', value: false },
      { label: 'Đã khóa', value: true }
    ]
  },

  // Form validation
  validation: {
    userName: {
      required: 'Tên đăng nhập là bắt buộc',
      minLength: 'Tên đăng nhập phải có ít nhất 3 ký tự',
      maxLength: 'Tên đăng nhập không được quá 50 ký tự'
    },
    email: {
      required: 'Email là bắt buộc',
      pattern: 'Email không đúng định dạng'
    },
    fullName: {
      required: 'Họ và tên là bắt buộc',
      minLength: 'Họ và tên phải có ít nhất 2 ký tự'
    }
  },

  // Messages
  messages: {
    success: {
      create: 'Tạo người dùng thành công',
      update: 'Cập nhật người dùng thành công',
      delete: 'Xóa người dùng thành công',
      lock: 'Khóa người dùng thành công',
      unlock: 'Mở khóa người dùng thành công'
    },
    error: {
      create: 'Không thể tạo người dùng',
      update: 'Không thể cập nhật người dùng',
      delete: 'Không thể xóa người dùng',
      load: 'Không lấy được danh sách người dùng',
      general: 'Đã xảy ra lỗi'
    },
    confirm: {
      delete: 'Bạn có chắc chắn muốn xóa người dùng này?',
      lock: 'Bạn có chắc chắn muốn khóa người dùng này?',
      unlock: 'Bạn có chắc chắn muốn mở khóa người dùng này?'
    }
  },

  // API endpoints
  api: {
    users: '/api/users',
    branches: '/api/branches'
  }
};

// Helper functions
export const getUserStatusConfig = (isActive: boolean) => {
  return USER_CONFIG.status.locked[isActive.toString() as keyof typeof USER_CONFIG.status.locked];
};

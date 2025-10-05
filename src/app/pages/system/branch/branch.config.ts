export const BRANCH_CONFIG = {

  // Breadcrumb configuration
  breadcrumb: {
    title: 'Quản lý chi nhánh',
    items: [
      { label: 'Quản trị hệ thống' },
      { label: 'Quản lý chi nhánh', active: true }
    ]
  },

  // Table configuration
  table: {
    columns: {
      approved: [
        { key: 'code', label: 'Mã chi nhánh', width: '120px' },
        { key: 'name', label: 'Tên chi nhánh', width: '200px' },
        { key: 'branchType', label: 'Loại chi nhánh', width: '140px' },
        { key: 'description', label: 'Mô tả', width: '250px' },
        { key: 'isActive', label: 'Trạng thái', width: '100px' },
        { key: 'actions', label: 'Thao tác', width: '120px' }
      ],
      pending: [
        { key: 'code', label: 'Mã chi nhánh', width: '120px' },
        { key: 'name', label: 'Tên chi nhánh', width: '200px' },
        { key: 'description', label: 'Mô tả', width: '200px' },
        { key: 'requestType', label: 'Loại yêu cầu', width: '120px' },
        { key: 'createdBy', label: 'Người tạo', width: '150px' },
        { key: 'createdDate', label: 'Ngày tạo', width: '120px' },
        { key: 'actions', label: 'Thao tác', width: '150px' }
      ]
    },
    skeleton: {
      approved: {
        rows: 8,
        columns: ['120px', '200px', '140px', '250px', '100px', '120px']
      },
      pending: {
        rows: 8,
        columns: ['120px', '200px', '200px', '120px', '150px', '120px', '150px']
      }
    }
  },

  // Search options
  search: {
    statusOptions: [
      { label: 'Tất cả', value: null },
      { label: 'Hoạt động', value: true },
      { label: 'Không hoạt động', value: false }
    ],
    requestTypeOptions: [
      { label: 'Tất cả', value: null },
      { label: 'Tạo mới', value: 'CREATE' },
      { label: 'Cập nhật', value: 'UPDATE' },
      { label: 'Xóa', value: 'DELETE' }
    ],
    branchTypeOptions: [
      { label: 'Hội sở chính', value: 1 },
      { label: 'Chi nhánh', value: 2 },
      { label: 'Phòng giao dịch', value: 3 }
    ]
  },

  // Form validation
  validation: {
    code: {
      required: 'Mã chi nhánh là bắt buộc',
      pattern: 'Mã chi nhánh chỉ được chứa chữ và số'
    },
    name: {
      required: 'Tên chi nhánh là bắt buộc',
      maxLength: 'Tên chi nhánh không được vượt quá 100 ký tự'
    },
    description: {
      maxLength: 'Mô tả không được vượt quá 500 ký tự'
    },
    comment: {
      maxLength: 'Ghi chú không được vượt quá 500 ký tự'
    }
  },

  // Messages
  messages: {
    success: {
      create: 'Gửi yêu cầu tạo chi nhánh thành công',
      update: 'Gửi yêu cầu cập nhật chi nhánh thành công',
      delete: 'Gửi yêu cầu xóa chi nhánh thành công',
      approve: 'Phê duyệt yêu cầu thành công',
      reject: 'Từ chối yêu cầu thành công'
    },
    error: {
      create: 'Không thể gửi yêu cầu tạo chi nhánh',
      update: 'Không thể gửi yêu cầu cập nhật chi nhánh',
      delete: 'Không thể gửi yêu cầu xóa chi nhánh',
      approve: 'Không thể phê duyệt yêu cầu',
      reject: 'Không thể từ chối yêu cầu',
      load: 'Không lấy được danh sách chi nhánh',
      loadDetail: 'Không thể lấy thông tin chi tiết',
      loadHistory: 'Không thể lấy lịch sử thay đổi',
      general: 'Đã xảy ra lỗi'
    },
    confirm: {
      approve: 'Bạn có chắc chắn muốn phê duyệt yêu cầu này?',
      reject: 'Bạn có chắc chắn muốn từ chối yêu cầu này?',
      delete: 'Bạn có chắc chắn muốn gửi yêu cầu xóa chi nhánh này?'
    }
  },

  // API endpoints
  api: {
    branches: '/api/branches',
    pendingBranches: '/api/branches/requests/pending',
    branchDetail: '/api/branches',
    branchHistory: '/api/branches/history'
  },

  // Tab configuration
  tabs: {
    items: [
      { id: 'approved', label: 'Đã duyệt', icon: 'fas fa-check-circle' },
      { id: 'pending', label: 'Chờ duyệt', icon: 'fas fa-clock' }
    ]
  }
};

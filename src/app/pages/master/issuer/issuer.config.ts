export const ISSUER_CONFIG = {

  // Breadcrumb configuration
  breadcrumb: {
    title: 'Tổ chức phát hành',
    items: [
      { label: 'Danh mục cơ sở' },
      { label: 'Tổ chức phát hành', active: true }
    ]
  },

  // Table configuration
  table: {
    columns: {
      approved: [
        { key: 'issuerCode', label: 'Mã tổ chức', width: '140px' },
        { key: 'shortName', label: 'Tên viết tắt', width: '160px' },
        { key: 'fullName', label: 'Tên đầy đủ', width: '260px' },
        { key: 'actions', label: 'Thao tác', width: '140px' }
      ],
      pending: [
        { key: 'issuerCode', label: 'Mã tổ chức', width: '140px' },
        { key: 'shortName', label: 'Tên viết tắt', width: '160px' },
        { key: 'fullName', label: 'Tên đầy đủ', width: '260px' },
        { key: 'action', label: 'Hành động', width: '120px' },
        { key: 'requestedDate', label: 'Ngày yêu cầu', width: '160px' },
        { key: 'makerName', label: 'Người tạo', width: '160px' },
        { key: 'actions', label: 'Thao tác', width: '140px' }
      ]
    },
    skeleton: {
      approved: { rows: 8, columns: ['140px', '160px', '260px', '140px'] },
      pending: {
        rows: 8,
        columns: ['140px', '160px', '260px', '120px', '160px', '160px', '140px']
      }
    }
  },

  // Search options (minimal)
  search: {
    branchOptions: [ { label: 'Tất cả chi nhánh', value: null } ],
    lockStatusOptions: [ { label: 'Tất cả', value: null } ]
  },

  // Messages
  messages: {
    success: {
      create: 'Gửi yêu cầu tạo nhà phát hành thành công',
      update: 'Gửi yêu cầu cập nhật thành công',
      delete: 'Gửi yêu cầu xóa thành công'
    },
    error: {
      create: 'Không thể tạo nhà phát hành',
      update: 'Không thể cập nhật',
      delete: 'Không thể xóa',
      load: 'Không lấy được danh sách',
      general: 'Đã xảy ra lỗi'
    },
    confirm: { delete: 'Bạn chắc chắn muốn xóa nhà phát hành này?' }
  },

  // API endpoints (reference)
  api: {
    users: '/api/issuers',
    branches: '/api/branches'
  }
};


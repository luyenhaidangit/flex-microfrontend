export const WORKFLOW_CONFIG = {
  breadcrumb: {
    title: 'Quản lý quy trình phê duyệt',
    items: [
      { label: 'Quản trị hệ thống' },
      { label: 'Quản lý quy trình', active: true }
    ]
  },

  table: {
    columns: {
      approved: [
        { key: 'code', label: 'Mã quy trình', width: '140px' },
        { key: 'name', label: 'Tên quy trình', width: '220px' },
        { key: 'version', label: 'Version', width: '100px' },
        { key: 'state', label: 'Trạng thái', width: '120px' },
        { key: 'isActive', label: 'Kích hoạt', width: '100px' },
        { key: 'actions', label: 'Thao tác', width: '180px' }
      ],
      pending: [
        { key: 'code', label: 'Mã quy trình', width: '140px' },
        { key: 'name', label: 'Tên quy trình', width: '220px' },
        { key: 'action', label: 'Hành động', width: '120px' },
        { key: 'requestedDate', label: 'Ngày yêu cầu', width: '150px' },
        { key: 'requestedBy', label: 'Người tạo', width: '150px' },
        { key: 'actions', label: 'Thao tác', width: '180px' }
      ]
    },
    skeleton: {
      approved: { rows: 8, columns: ['140px','220px','100px','120px','100px','180px'] },
      pending: { rows: 8, columns: ['140px','220px','120px','150px','150px','180px'] }
    }
  },

  search: {
    stateOptions: [
      { label: 'Tất cả', value: null },
      { label: 'Draft', value: 'Draft' },
      { label: 'Active', value: 'Active' },
      { label: 'Deprecated', value: 'Deprecated' }
    ]
  },

  messages: {
    success: {
      create: 'Tạo workflow thành công',
      update: 'Cập nhật workflow thành công',
      publish: 'Gửi duyệt publish thành công',
      approve: 'Phê duyệt thành công',
      reject: 'Từ chối thành công'
    },
    error: {
      load: 'Không lấy được danh sách workflow',
      general: 'Đã xảy ra lỗi'
    }
  },

  api: {
    workflows: '/api/workflow/definitions',
    pending: '/api/workflow/requests/pending'
  }
};



export const SECURITIES_CONFIG = {
  // Breadcrumb configuration
  breadcrumb: {
    title: 'Thông tin chứng khoán',
    items: [
      { label: 'Danh mục cơ sở' },
      { label: 'Thông tin chứng khoán', active: true }
    ]
  },

  // Table configuration
  table: {
    columns: [
      { key: 'securitiesCode', label: 'Mã chứng khoán', width: '140px' },
      { key: 'issuerCode', label: 'Mã tổ chức phát hành', width: '160px' },
      { key: 'domainCode', label: 'Mã miền', width: '120px' },
      { key: 'symbol', label: 'Mã giao dịch', width: '120px' },
      { key: 'isinCode', label: 'Mã ISIN', width: '140px' }
    ],
    skeleton: {
      rows: 8,
      columns: ['140px', '160px', '120px', '120px', '140px']
    }
  },

  // Messages
  messages: {
    success: {
      load: 'Tải dữ liệu thành công'
    },
    error: {
      load: 'Không lấy được danh sách chứng khoán',
      general: 'Đã xảy ra lỗi'
    }
  },

  // API endpoints
  api: {
    securities: '/api/securities'
  }
};

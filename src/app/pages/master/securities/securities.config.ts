export const SECURITIES_CONFIG = {
  breadcrumb: {
    title: 'Thông tin chứng khoán',
    items: [
      { label: 'Danh mục cơ sở' },
      { label: 'Thông tin chứng khoán', active: true }
    ]
  },
  table: {
    columns: [
      { key: 'securitiesCode', label: 'Mã nội bộ', width: '140px' },
      { key: 'symbol', label: 'Mã chứng khoán', width: '120px' },
      { key: 'issuerName', label: 'Tên tổ chức phát hành', width: '200px' },
      { key: 'domainName', label: 'Miền thanh toán', width: '180px' },
      { key: 'isinCode', label: 'Mã ISIN', width: '140px' },
      { key: 'actions', label: 'Thao tác', width: '120px' }
    ],
    skeleton: {
      rows: 8,
      columns: ['140px', '200px', '180px', '120px', '140px', '120px']
    }
  },
  pagination: {
    pageSizeOptions: [
      { value: 10, label: '10' },
      { value: 20, label: '20' },
      { value: 50, label: '50' },
      { value: 100, label: '100' }
    ]
  }
};

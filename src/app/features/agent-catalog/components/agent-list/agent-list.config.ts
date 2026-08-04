import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';

export const AGENT_LIST_CONFIG = {

  // Breadcrumb configuration
  breadcrumb: {
    title: 'Danh mục Agent',
    items: [
      { label: 'Quản lý Agent' },
      { label: 'Danh mục Agent', active: true }
    ]
  },

  // Table configuration
  table: {
    columns: [
      { key: 'name',        label: 'Tên Agent',   width: '200px' },
      { key: 'description', label: 'Mô tả',        width: '300px' },
      { key: 'status',      label: 'Trạng thái',   width: '150px' },
      { key: 'createdAt',   label: 'Ngày tạo',     width: '180px' },
      { key: 'actions',     label: 'Thao tác',     width: '120px' }
    ],
    skeleton: {
      rows: 8,
      columns: ['200px', '300px', '150px', '180px', '120px']
    }
  },

  // Pagination configuration
  pagination: {
    pageSizeOptions: DEFAULT_PER_PAGE_OPTIONS
  }
};

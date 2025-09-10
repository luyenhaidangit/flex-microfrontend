import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';
import { REQUEST_TYPE_OPTIONS } from 'src/app/core/constants/request-types.constant';

export const ENTITY_LIST_CONFIG = {

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

  // Filter configuration
  filter: {
    requestTypeOptions: REQUEST_TYPE_OPTIONS
  }
};

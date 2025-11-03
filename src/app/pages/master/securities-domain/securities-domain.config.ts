﻿export const SECURITIES_DOMAIN_CONFIG = {
  breadcrumb: {
    title: 'Miền thanh toán',
    items: [
      { label: 'Danh mục cơ sở' },
      { label: 'Miền thanh toán', active: true }
    ]
  },
  table: {
    columns: [
      { key: 'domain', label: 'Tên Domain', width: '220px' },
      { key: 'settlementType', label: 'Loại hình TT', width: '140px' },
      { key: 'settlementCycle', label: 'Chu kì TT', width: '120px' },
      { key: 'secSettlementType', label: 'Phương thức TT CK', width: '180px' },
      { key: 'cashSettleType', label: 'Phương thức TT Tiền', width: '180px' },
      { key: 'isDefault', label: 'Domain mặc định', width: '140px' }
    ],
    skeleton: {
      rows: 8,
      columns: ['220px', '140px', '120px', '180px', '180px', '140px']
    }
  }
};


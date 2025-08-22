export interface AppTab {
  id: string;               // 'approved' | 'pending' | ...
  label: string;            // Tiêu đề hiển thị
  icon?: string;            // ví dụ: 'fas fa-check-circle'
  badge?: number | string;  // số chờ duyệt, v.v.
  badgeType?: 'default' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}
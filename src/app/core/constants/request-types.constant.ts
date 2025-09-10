export const REQUEST_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
} as const;

export const REQUEST_TYPE_OPTIONS = [
  { value: null, label: 'Tất cả' },
  { value: REQUEST_TYPES.CREATE, label: 'Tạo mới' },
  { value: REQUEST_TYPES.UPDATE, label: 'Cập nhật' },
  { value: REQUEST_TYPES.DELETE, label: 'Xóa' }
] as const;

export type RequestType = typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];

export const STATUS_INFO: { [key: string]: { text: string; class: string } } = {
    'A': { text: 'Hoạt động', class: 'bg-success' },
    'P': { text: 'Chờ duyệt', class: 'bg-warning' },
};

//   /* helpers */
//   getStatusText(code: string)  { return this.STATUS_MAP[code]?.text  || code; }
//   getStatusClass(code: string) { return this.STATUS_MAP[code]?.class || 'bg-light'; }

//   getPendingRequestText(type: string): string {
//     if (!type) return '';
//     const map: Record<string, string> = {
//       UPDATE: 'Chờ duyệt sửa',
//       CREATE: 'Chờ duyệt thêm',
//       DELETE: 'Chờ duyệt xóa'
//     };
//     return map[type] || 'Chờ duyệt';
//   }

// DEFAULT_STATUS_OPTIONS = [
//     { label: 'Tất cả',   value: ''         },
//     { label: 'Hoạt động', value: 'ACTIVE'  },
//     { label: 'Chờ duyệt', value: 'PENDING' },
//     { label: 'Ngừng',     value: 'INACTIVE'}
//   ];

// <!-- status -->
// <div class="form-group col-4">
//   <select class="form-select"
//           [(ngModel)]="searchParams.status">
//     <option *ngFor="let opt of DEFAULT_STATUS_OPTIONS"
//             [ngValue]="opt.value">
//       {{ opt.label }}
//     </option>
//   </select>
// </div>

// STATUS_MAP: Record<string, { text: string; class: string }> = {
//     ACTIVE  : { text: 'Hoạt động', class: 'bg-success'   },
//     PENDING : { text: 'Chờ duyệt', class: 'bg-warning'   },
//     INACTIVE: { text: 'Ngừng',     class: 'bg-secondary' }
//   };

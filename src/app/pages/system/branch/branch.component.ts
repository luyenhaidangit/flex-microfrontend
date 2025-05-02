import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/core/services/system.service';

interface BranchSearch {
  pageIndex: number;
  pageSize: number;
  keyword?: string;
  status?: string;          // '', 'ACTIVE', 'PENDING', 'INACTIVE'
}

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Quản trị hệ thống' },
    { label: 'Quản lý chi nhánh', active: true }
  ];

  /* table data & paging */
  items: any[] = [];
  pagedInfo = {
    pageIndex : 1,
    pageSize  : 10,
    totalPages: 0,
    totalItems: 0
  };

  /* search params */
  searchParams: BranchSearch = {
    pageIndex: 1,
    pageSize : 10,
    keyword  : '',
    status   : ''
  };

  /** trạng thái -> text / badge class */
  STATUS_MAP: Record<string, { text: string; class: string }> = {
    ACTIVE  : { text: 'Hoạt động', class: 'bg-success'   },
    PENDING : { text: 'Chờ duyệt', class: 'bg-warning'   },
    INACTIVE: { text: 'Ngừng',     class: 'bg-secondary' }
  };

  /* combo page size & status list */
  DEFAULT_PER_PAGE_OPTIONS = [
    { label: 10,  value: 10  },
    { label: 25,  value: 25  },
    { label: 50,  value: 50  },
    { label: 100, value: 100 }
  ];

  DEFAULT_STATUS_OPTIONS = [
    { label: 'Tất cả',   value: ''         },
    { label: 'Hoạt động', value: 'ACTIVE'  },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Ngừng',     value: 'INACTIVE'}
  ];

  constructor(private systemService: SystemService) {}

  ngOnInit(): void {
    this.getItems();
  }

  /* call API */
  getItems(): void {
    this.systemService.getBranchesPaging(this.searchParams)
      .subscribe(res => {
        if (res?.isSuccess) {
          const { items, ...page } = res.data;
          this.items     = items ?? [];
          this.pagedInfo = {
            pageIndex : page.pageIndex,
            pageSize  : page.pageSize,
            totalPages: page.totalPages,
            totalItems: page.totalItems
          };
        }
      });
  }

  /* paging */
  changePage(page: number): void {
    if (page < 1 || page > this.pagedInfo.totalPages || page === this.pagedInfo.pageIndex) { return; }
    this.searchParams.pageIndex = page;
    this.getItems();
  }

  changePageSize(): void {
    this.searchParams.pageIndex = 1;           // reset về trang 1
    this.getItems();
  }

  /* helpers */
  getStatusText(code: string)  { return this.STATUS_MAP[code]?.text  || code; }
  getStatusClass(code: string) { return this.STATUS_MAP[code]?.class || 'bg-light'; }

  getPendingRequestText(type: string): string {
    if (!type) return '';
    const map: Record<string, string> = {
      UPDATE: 'Chờ duyệt sửa',
      CREATE: 'Chờ duyệt thêm',
      DELETE: 'Chờ duyệt xóa'
    };
    return map[type] || 'Chờ duyệt';
  }
}

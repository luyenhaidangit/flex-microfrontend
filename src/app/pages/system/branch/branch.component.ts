import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/core/services/system.service';
import { DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/constants/shared.constant';

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

  items: any[] = [];

  pagingState = {
    pageIndex : 1,
    pageSize  : 10,
    totalPages: 0,
    totalItems: 0,
    keyword   : ''
  };

  DEFAULT_PER_PAGE_OPTIONS = DEFAULT_PER_PAGE_OPTIONS;

  constructor(private systemService: SystemService) {}

  ngOnInit(): void {
    this.getItems();
  }

  get searchParams(): any {
    const { pageIndex, pageSize, keyword } = this.pagingState;
    return { pageIndex, pageSize, keyword };
  }

  getItems(): void {
    this.systemService.getBranchesPaging(this.searchParams)
      .subscribe(res => {
        if (res?.isSuccess) {
          const { items, ...page } = res.data;
          this.items = items ?? [];
          Object.assign(this.pagingState, {
            pageIndex : page.pageIndex,
            pageSize  : page.pageSize,
            totalPages: page.totalPages,
            totalItems: page.totalItems
          });
        }
      });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.pagingState.totalPages || page === this.pagingState.pageIndex) return;
    this.pagingState.pageIndex = page;
    this.getItems();
  }

  changePageSize(): void {
    this.pagingState.pageIndex = 1;
    this.getItems();
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageSizeOption } from '../page-size-selector/page-size-selector.component';

export interface PaginationState {
  index: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

@Component({
  selector: 'app-pagination',
  template: `
    <div class="table-filter d-flex justify-content-between align-items-center mt-2">
      <!-- Page numbers -->
      <app-page-numbers
        [currentPage]="paginationState.index"
        [totalPages]="paginationState.totalPages"
        [maxVisiblePages]="maxVisiblePages"
        (pageChanged)="onPageChange($event)">
      </app-page-numbers>
      
      <!-- Page size selector -->
      <app-page-size-selector
        [currentPageSize]="paginationState.size"
        [totalItems]="paginationState.totalItems"
        [pageSizeOptions]="pageSizeOptions"
        (pageSizeChanged)="onPageSizeChange($event)">
      </app-page-size-selector>
    </div>
  `,
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() paginationState: PaginationState = {
    index: 1,
    size: 10,
    totalItems: 0,
    totalPages: 1
  };

  @Input() pageSizeOptions: PageSizeOption[] = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
  ];

  @Input() maxVisiblePages: number = 5;

  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();

  onPageChange(page: number): void {
    this.pageChanged.emit(page);
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSizeChanged.emit(pageSize);
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-numbers',
  template: `
    <ul class="pagination mb-0">
      <!-- Previous button -->
      <li class="page-item cursor-pointer" [class.disabled]="currentPage === 1">
        <a class="page-link" (click)="onPageChange(currentPage - 1)">
          <i class="mdi mdi-chevron-left"></i>
        </a>
      </li>
      
      <!-- Page numbers -->
      <li 
        *ngFor="let page of getPageNumbers(); let idx = index" 
        class="page-item cursor-pointer"
        [class.active]="currentPage === page">
        <a class="page-link" (click)="onPageChange(page)">
          {{ page }}
        </a>
      </li>
      
      <!-- Next button -->
      <li class="page-item cursor-pointer" [class.disabled]="currentPage === totalPages">
        <a class="page-link" (click)="onPageChange(currentPage + 1)">
          <i class="mdi mdi-chevron-right"></i>
        </a>
      </li>
    </ul>
  `,
  styleUrls: ['./page-numbers.component.scss']
})
export class PageNumbersComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() maxVisiblePages: number = 5; // Số trang tối đa hiển thị

  @Output() pageChanged = new EventEmitter<number>();

  onPageChange(page: number): void {
    // Validate page number
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    
    this.pageChanged.emit(page);
  }

  /**
   * Tạo danh sách số trang để hiển thị
   * Logic hiển thị thông minh: hiển thị trang đầu, cuối và các trang xung quanh trang hiện tại
   */
  getPageNumbers(): number[] {
    if (this.totalPages <= this.maxVisiblePages) {
      // Nếu tổng số trang <= maxVisiblePages, hiển thị tất cả
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    const halfVisible = Math.floor(this.maxVisiblePages / 2);
    
    let startPage = Math.max(1, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages, startPage + this.maxVisiblePages - 1);
    
    // Điều chỉnh startPage nếu endPage gần cuối
    if (endPage - startPage < this.maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
    }

    // Thêm trang đầu nếu cần
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push(-1); // Dấu hiệu có trang bị ẩn
      }
    }

    // Thêm các trang chính
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Thêm trang cuối nếu cần
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pages.push(-1); // Dấu hiệu có trang bị ẩn
      }
      pages.push(this.totalPages);
    }

    return pages;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-numbers',
  templateUrl: './page-numbers.component.html',
  styleUrls: ['./page-numbers.component.scss']
})
export class PageNumbersComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;

  @Output() pageChanged = new EventEmitter<number>();

  onPageChange(page: number): void {
    // Validate page number
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    
    this.pageChanged.emit(page);
  }

  // Smart paging: show pages around current page with ellipsis
  getFixedPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show
    
    if (this.totalPages <= maxVisible) {
      // Show all pages if total is small
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    
    // Always show first page
    pages.push(1);
    
    if (this.currentPage <= 4) {
      // Current page is near the beginning
      for (let i = 2; i <= Math.min(5, this.totalPages - 1); i++) {
        pages.push(i);
      }
      if (this.totalPages > 6) {
        pages.push(-1); // Ellipsis
      }
      pages.push(this.totalPages);
    } else if (this.currentPage >= this.totalPages - 3) {
      // Current page is near the end
      pages.push(-1); // Ellipsis
      for (let i = Math.max(this.totalPages - 4, 2); i <= this.totalPages - 1; i++) {
        pages.push(i);
      }
      pages.push(this.totalPages);
    } else {
      // Current page is in the middle
      pages.push(-1); // Ellipsis
      for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push(-1); // Ellipsis
      pages.push(this.totalPages);
    }
    
    return pages;
  }
}

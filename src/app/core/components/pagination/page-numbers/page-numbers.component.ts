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

  // New fixed paging: first 3, ellipsis, last 3
  getFixedPageNumbers(): number[] {
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    return [1, 2, 3, -1, this.totalPages - 2, this.totalPages - 1, this.totalPages];
  }
}

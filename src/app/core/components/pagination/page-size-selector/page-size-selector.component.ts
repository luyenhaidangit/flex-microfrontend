import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface PageSizeOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-page-size-selector',
  template: `
    <div class="per-page">
      Hiển thị
      <select 
        class="mx-1 cursor-pointer" 
        [value]="currentPageSize" 
        (change)="onPageSizeChange($event)">
        <option 
          *ngFor="let opt of pageSizeOptions" 
          [value]="opt.value" 
          class="cursor-pointer">
          {{ opt.label }}
        </option>
      </select>
      / {{ totalItems }} tổng số bản ghi
    </div>
  `,
  styleUrls: ['./page-size-selector.component.scss']
})
export class PageSizeSelectorComponent {
  @Input() currentPageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() pageSizeOptions: PageSizeOption[] = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
  ];

  @Output() pageSizeChanged = new EventEmitter<number>();

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPageSize = parseInt(target.value, 10);
    
    if (newPageSize !== this.currentPageSize) {
      this.pageSizeChanged.emit(newPageSize);
    }
  }
}

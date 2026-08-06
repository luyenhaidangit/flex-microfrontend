import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ViewMode = 'card' | 'table';

export interface ViewToggleOption {
  value: ViewMode;
  icon: string;
  title: string;
  label?: string;
}

@Component({
  selector: 'app-view-toggle',
  templateUrl: './view-toggle.component.html',
  styleUrls: ['./view-toggle.component.scss']
})
export class ViewToggleComponent {
  @Input() viewMode: ViewMode = 'card';
  @Input() options: ViewToggleOption[] = [
    { value: 'card', icon: 'bx bx-grid-alt', title: 'Hiển thị dạng Thẻ (Card)' },
    { value: 'table', icon: 'bx bx-list-ul', title: 'Hiển thị dạng Bảng (Cột)' }
  ];
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() viewModeChange = new EventEmitter<ViewMode>();

  setViewMode(mode: ViewMode): void {
    if (this.viewMode !== mode) {
      this.viewMode = mode;
      this.viewModeChange.emit(mode);
    }
  }
}

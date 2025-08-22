import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {
  @Input() tabs: any[] = [];
  @Input() activeId?: string;
  @Input() navClass = 'nav-pills nav-tabs mb-3'; // cho phép tùy biến class ngoài

  @Output() activeIdChange = new EventEmitter<string>();  // two-way binding
  @Output() changed = new EventEmitter<any>();         // bắn luôn object tab

  onSelect(tab: any) {
    if (tab.disabled) return;
    this.activeId = tab.id;
    this.activeIdChange.emit(tab.id);
    this.changed.emit(tab);
  }
}
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-page-title',
  templateUrl: './pagetitle.component.html',
  styleUrls: ['./pagetitle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagetitleComponent implements OnInit {

  @Input() breadcrumbItems;
  @Input() title: string;

  constructor() { }

  ngOnInit() {    
  }

  get computedTitle(): string {
    const explicit = (this.title ?? '').trim();
    if (explicit) return explicit;

    if (Array.isArray(this.breadcrumbItems) && this.breadcrumbItems.length) {
      const active = this.breadcrumbItems.find((i) => i?.active);
      const fallback = active?.label ?? this.breadcrumbItems[this.breadcrumbItems.length - 1]?.label;
      return (fallback ?? '').toString();
    }

    return '';
  }
}

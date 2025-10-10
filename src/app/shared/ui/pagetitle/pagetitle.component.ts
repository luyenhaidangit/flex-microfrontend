import { Component, OnInit, Input, TemplateRef, ContentChild } from '@angular/core';

@Component({
  selector: 'app-page-title',
  templateUrl: './pagetitle.component.html',
  styleUrls: ['./pagetitle.component.scss']
})
export class PagetitleComponent implements OnInit {

  @Input() breadcrumbItems;
  @Input() title: string;
  // Optional info drawer title and template
  @Input() infoTitle?: string;
  @Input() infoTemplate?: TemplateRef<any>;
  @ContentChild('pageInfo') set inlineInfo(tpl: TemplateRef<any> | null) {
    if (tpl) this.infoTemplate = tpl;
  }

  showInfo = false;

  constructor() { }

  ngOnInit() {
  }

  openInfo(): void { this.showInfo = true; }
  closeInfo(): void { this.showInfo = false; }

}

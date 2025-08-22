import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
  badgeClass?: string;
  disabled?: boolean;
  hidden?: boolean;
  count?: number;
  customClass?: string;
}

export interface TabsetConfig {
  tabs: TabConfig[];
  activeTab?: string;
  tabsetClass?: string;
  tabClass?: string;
  showBadge?: boolean;
  showCount?: boolean;
  vertical?: boolean;
  pills?: boolean;
  justified?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

@Component({
  selector: 'app-custom-tabset',
  templateUrl: './custom-tabset.component.html',
  styleUrls: ['./custom-tabset.component.scss']
})
export class CustomTabsetComponent implements OnInit, OnChanges {
  @Input() config!: TabsetConfig;
  @Input() activeTabId?: string;
  
  @Output() tabChange = new EventEmitter<string>();
  @Output() tabClick = new EventEmitter<TabConfig>();

  currentActiveTab: string = '';

  ngOnInit(): void {
    this.initializeActiveTab();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTabId'] || changes['config']) {
      this.initializeActiveTab();
    }
  }

  private initializeActiveTab(): void {
    if (this.activeTabId && this.config?.tabs) {
      const tabExists = this.config.tabs.find(tab => tab.id === this.activeTabId);
      if (tabExists) {
        this.currentActiveTab = this.activeTabId;
      }
    }
    
    if (!this.currentActiveTab && this.config?.tabs?.length > 0) {
      this.currentActiveTab = this.config.tabs[0].id;
    }
  }

  onTabClick(tab: TabConfig): void {
    if (tab.disabled) return;
    
    this.currentActiveTab = tab.id;
    this.tabChange.emit(tab.id);
    this.tabClick.emit(tab);
  }

  getTabClasses(tab: TabConfig): string {
    let classes = this.config.tabClass || '';
    
    if (this.currentActiveTab === tab.id) {
      classes += ' active';
    }
    
    if (tab.disabled) {
      classes += ' disabled';
    }
    
    if (tab.customClass) {
      classes += ` ${tab.customClass}`;
    }
    
    return classes.trim();
  }

  getTabsetClasses(): string {
    let classes = this.config.tabsetClass || 'nav-tabs mb-3';
    
    if (this.config.pills) {
      classes = classes.replace('nav-tabs', 'nav-pills');
    }
    
    if (this.config.vertical) {
      classes += ' flex-column';
    }
    
    if (this.config.justified) {
      classes += ' nav-justified';
    }
    
    if (this.config.size) {
      classes += ` nav-${this.config.size}`;
    }
    
    return classes;
  }

  isTabVisible(tab: TabConfig): boolean {
    return !tab.hidden;
  }
}

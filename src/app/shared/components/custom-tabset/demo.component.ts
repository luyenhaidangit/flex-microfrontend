import { Component, OnInit } from '@angular/core';
import { TabConfigService, TabsetConfig } from './custom-tabset.component';

@Component({
  selector: 'app-custom-tabset-demo',
  template: `
    <div class="container mt-4">
      <h2>Demo Custom Tabset Component</h2>
      
      <!-- 1. Approval Tabset -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>1. Approval Tabset (Đã duyệt/Chờ duyệt)</h5>
        </div>
        <div class="card-body">
          <app-custom-tabset
            [config]="approvalTabset"
            [activeTabId]="activeApprovalTab"
            (tabChange)="onApprovalTabChange($event)">
          </app-custom-tabset>
          <p class="mt-3">Active tab: {{ activeApprovalTab }}</p>
        </div>
      </div>

      <!-- 2. Status Tabset -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>2. Status Tabset (Hoạt động/Không hoạt động)</h5>
        </div>
        <div class="card-body">
          <app-custom-tabset
            [config]="statusTabset"
            [activeTabId]="activeStatusTab"
            (tabChange)="onStatusTabChange($event)">
          </app-custom-tabset>
          <p class="mt-3">Active tab: {{ activeStatusTab }}</p>
        </div>
      </div>

      <!-- 3. Type Tabset -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>3. Type Tabset (Tùy chỉnh loại)</h5>
        </div>
        <div class="card-body">
          <app-custom-tabset
            [config]="typeTabset"
            [activeTabId]="activeTypeTab"
            (tabChange)="onTypeTabChange($event)">
          </app-custom-tabset>
          <p class="mt-3">Active tab: {{ activeTypeTab }}</p>
        </div>
      </div>

      <!-- 4. Custom Tabset -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>4. Custom Tabset (Tùy chỉnh hoàn toàn)</h5>
        </div>
        <div class="card-body">
          <app-custom-tabset
            [config]="customTabset"
            [activeTabId]="activeCustomTab"
            (tabChange)="onCustomTabChange($event)">
          </app-custom-tabset>
          <p class="mt-3">Active tab: {{ activeCustomTab }}</p>
        </div>
      </div>

      <!-- 5. Vertical Tabset -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>5. Vertical Tabset</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <app-custom-tabset
                [config]="verticalTabset"
                [activeTabId]="activeVerticalTab"
                (tabChange)="onVerticalTabChange($event)">
              </app-custom-tabset>
            </div>
            <div class="col-md-9">
              <p>Active tab: {{ activeVerticalTab }}</p>
              <p>Nội dung của tab {{ activeVerticalTab }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Controls</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Update Counts</h6>
              <button class="btn btn-sm btn-primary me-2" (click)="updateApprovalCounts()">
                Update Approval Counts
              </button>
              <button class="btn btn-sm btn-success me-2" (click)="updateStatusCounts()">
                Update Status Counts
              </button>
              <button class="btn btn-sm btn-warning" (click)="updateTypeCounts()">
                Update Type Counts
              </button>
            </div>
            <div class="col-md-6">
              <h6>Toggle Tabs</h6>
              <button class="btn btn-sm btn-info me-2" (click)="toggleCustomTab()">
                Toggle Custom Tab
              </button>
              <button class="btn btn-sm btn-secondary" (click)="disableCustomTab()">
                Disable Custom Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    
    .btn {
      margin-bottom: 0.5rem;
    }
  `]
})
export class CustomTabsetDemoComponent implements OnInit {
  // Approval Tabset
  approvalTabset!: TabsetConfig;
  activeApprovalTab = 'approved';

  // Status Tabset
  statusTabset!: TabsetConfig;
  activeStatusTab = 'active';

  // Type Tabset
  typeTabset!: TabsetConfig;
  activeTypeTab = 'type1';

  // Custom Tabset
  customTabset!: TabsetConfig;
  activeCustomTab = 'custom1';

  // Vertical Tabset
  verticalTabset!: TabsetConfig;
  activeVerticalTab = 'tab1';

  constructor(private tabConfigService: TabConfigService) {}

  ngOnInit(): void {
    this.initializeTabsets();
  }

  private initializeTabsets(): void {
    // 1. Approval Tabset
    this.approvalTabset = this.tabConfigService.createApprovalTabset(15, 8, {
      pills: true,
      showCount: true
    });

    // 2. Status Tabset
    this.statusTabset = this.tabConfigService.createStatusTabset(25, 3, {
      pills: true,
      showCount: true
    });

    // 3. Type Tabset
    const types = [
      { id: 'type1', label: 'Loại 1', count: 12, icon: 'bx bx-star' },
      { id: 'type2', label: 'Loại 2', count: 8, icon: 'bx bx-heart' },
      { id: 'type3', label: 'Loại 3', count: 20, icon: 'bx bx-bookmark' },
      { id: 'type4', label: 'Loại 4', count: 5, icon: 'bx bx-diamond' }
    ];
    this.typeTabset = this.tabConfigService.createTypeTabset(types, {
      pills: true,
      showCount: true
    });

    // 4. Custom Tabset
    const customTabs = [
      {
        id: 'custom1',
        label: 'Tab tùy chỉnh 1',
        icon: 'bx bx-custom',
        badge: 'NEW',
        badgeClass: 'badge-success',
        customClass: 'tab-custom-primary'
      },
      {
        id: 'custom2',
        label: 'Tab tùy chỉnh 2',
        icon: 'bx bx-custom2',
        count: 15,
        customClass: 'tab-custom-success'
      },
      {
        id: 'custom3',
        label: 'Tab tùy chỉnh 3',
        icon: 'bx bx-custom3',
        count: 8,
        customClass: 'tab-custom-warning'
      }
    ];
    this.customTabset = this.tabConfigService.createCustomTabset(customTabs, {
      pills: true,
      showCount: true,
      justified: true
    });

    // 5. Vertical Tabset
    const verticalTabs = [
      { id: 'tab1', label: 'Tab 1', icon: 'bx bx-home' },
      { id: 'tab2', label: 'Tab 2', icon: 'bx bx-user' },
      { id: 'tab3', label: 'Tab 3', icon: 'bx bx-cog' },
      { id: 'tab4', label: 'Tab 4', icon: 'bx bx-info-circle' }
    ];
    this.verticalTabset = this.tabConfigService.createCustomTabset(verticalTabs, {
      vertical: true,
      pills: true
    });
  }

  // Event handlers
  onApprovalTabChange(tabId: string): void {
    this.activeApprovalTab = tabId;
  }

  onStatusTabChange(tabId: string): void {
    this.activeStatusTab = tabId;
  }

  onTypeTabChange(tabId: string): void {
    this.activeTypeTab = tabId;
  }

  onCustomTabChange(tabId: string): void {
    this.activeCustomTab = tabId;
  }

  onVerticalTabChange(tabId: string): void {
    this.activeVerticalTab = tabId;
  }

  // Control methods
  updateApprovalCounts(): void {
    const newApprovedCount = Math.floor(Math.random() * 50) + 10;
    const newPendingCount = Math.floor(Math.random() * 20) + 1;
    
    this.approvalTabset = this.tabConfigService.updateTabCount(
      this.approvalTabset,
      'approved',
      newApprovedCount
    );
    
    this.approvalTabset = this.tabConfigService.updateTabCount(
      this.approvalTabset,
      'pending',
      newPendingCount
    );
  }

  updateStatusCounts(): void {
    const newActiveCount = Math.floor(Math.random() * 100) + 20;
    const newInactiveCount = Math.floor(Math.random() * 30) + 1;
    
    this.statusTabset = this.tabConfigService.updateTabCount(
      this.statusTabset,
      'active',
      newActiveCount
    );
    
    this.statusTabset = this.tabConfigService.updateTabCount(
      this.statusTabset,
      'inactive',
      newInactiveCount
    );
  }

  updateTypeCounts(): void {
    this.typeTabset.tabs.forEach(tab => {
      const newCount = Math.floor(Math.random() * 50) + 5;
      this.typeTabset = this.tabConfigService.updateTabCount(
        this.typeTabset,
        tab.id,
        newCount
      );
    });
  }

  toggleCustomTab(): void {
    const custom3Tab = this.customTabset.tabs.find(tab => tab.id === 'custom3');
    if (custom3Tab) {
      this.customTabset = this.tabConfigService.toggleTabVisibility(
        this.customTabset,
        'custom3',
        !custom3Tab.hidden
      );
    }
  }

  disableCustomTab(): void {
    const custom2Tab = this.customTabset.tabs.find(tab => tab.id === 'custom2');
    if (custom2Tab) {
      this.customTabset = this.tabConfigService.toggleTabDisabled(
        this.customTabset,
        'custom2',
        !custom2Tab.disabled
      );
    }
  }
}

import { Injectable } from '@angular/core';
import { TabConfig, TabsetConfig } from '../components/custom-tabset/custom-tabset.component';

@Injectable({
  providedIn: 'root'
})
export class TabConfigService {

  /**
   * Tạo cấu hình tab cơ bản cho quản lý phê duyệt
   */
  createApprovalTabset(
    approvedCount?: number, 
    pendingCount?: number, 
    options: Partial<TabsetConfig> = {}
  ): TabsetConfig {
    const tabs: TabConfig[] = [
      {
        id: 'approved',
        label: 'Đã duyệt',
        icon: 'bx bx-check-circle',
        count: approvedCount,
        customClass: 'tab-custom-success'
      },
      {
        id: 'pending',
        label: 'Chờ duyệt',
        icon: 'bx bx-time',
        count: pendingCount,
        customClass: 'tab-custom-warning'
      }
    ];

    return {
      tabs,
      pills: true,
      showCount: true,
      tabsetClass: 'nav-pills nav-tabs mb-3',
      ...options
    };
  }

  /**
   * Tạo cấu hình tab cho quản lý trạng thái
   */
  createStatusTabset(
    activeCount?: number,
    inactiveCount?: number,
    options: Partial<TabsetConfig> = {}
  ): TabsetConfig {
    const tabs: TabConfig[] = [
      {
        id: 'active',
        label: 'Hoạt động',
        icon: 'bx bx-check-circle',
        count: activeCount,
        customClass: 'tab-custom-success'
      },
      {
        id: 'inactive',
        label: 'Không hoạt động',
        icon: 'bx bx-x-circle',
        count: inactiveCount,
        customClass: 'tab-custom-danger'
      }
    ];

    return {
      tabs,
      pills: true,
      showCount: true,
      ...options
    };
  }

  /**
   * Tạo cấu hình tab cho quản lý loại
   */
  createTypeTabset(
    types: Array<{ id: string; label: string; count?: number; icon?: string }>,
    options: Partial<TabsetConfig> = {}
  ): TabsetConfig {
    const tabs: TabConfig[] = types.map(type => ({
      id: type.id,
      label: type.label,
      icon: type.icon,
      count: type.count
    }));

    return {
      tabs,
      pills: true,
      showCount: true,
      ...options
    };
  }

  /**
   * Tạo cấu hình tab tùy chỉnh
   */
  createCustomTabset(
    tabs: TabConfig[],
    options: Partial<TabsetConfig> = {}
  ): TabsetConfig {
    return {
      tabs,
      ...options
    };
  }

  /**
   * Cập nhật số lượng cho tab
   */
  updateTabCount(
    config: TabsetConfig,
    tabId: string,
    count: number
  ): TabsetConfig {
    const updatedConfig = { ...config };
    const tab = updatedConfig.tabs.find(t => t.id === tabId);
    
    if (tab) {
      tab.count = count;
    }
    
    return updatedConfig;
  }

  /**
   * Thêm tab mới vào cấu hình
   */
  addTab(
    config: TabsetConfig,
    newTab: TabConfig
  ): TabsetConfig {
    return {
      ...config,
      tabs: [...config.tabs, newTab]
    };
  }

  /**
   * Ẩn/hiện tab
   */
  toggleTabVisibility(
    config: TabsetConfig,
    tabId: string,
    hidden: boolean
  ): TabsetConfig {
    const updatedConfig = { ...config };
    const tab = updatedConfig.tabs.find(t => t.id === tabId);
    
    if (tab) {
      tab.hidden = hidden;
    }
    
    return updatedConfig;
  }

  /**
   * Vô hiệu hóa/kích hoạt tab
   */
  toggleTabDisabled(
    config: TabsetConfig,
    tabId: string,
    disabled: boolean
  ): TabsetConfig {
    const updatedConfig = { ...config };
    const tab = updatedConfig.tabs.find(t => t.id === tabId);
    
    if (tab) {
      tab.disabled = disabled;
    }
    
    return updatedConfig;
  }
}

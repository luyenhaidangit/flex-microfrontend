import { Component, Input, OnInit } from '@angular/core';

export type BadgeType = 'status' | 'request' | 'pending' | 'custom';

export interface BadgeConfig {
  label: string;
  class: string;
  value: any;
}

export interface BadgeTypeConfig {
  [key: string]: BadgeConfig;
}

// Default configs for different badge types
const DEFAULT_CONFIGS: Record<BadgeType, BadgeTypeConfig> = {
  status: {
    ACTIVE: {
      label: 'Hoạt động',
      class: 'badge-soft-success',
      value: true
    },
    INACTIVE: {
      label: 'Không hoạt động',
      class: 'badge-soft-danger',
      value: false
    },
    UNKNOWN: {
      label: 'Không xác định',
      class: 'badge-soft-light',
      value: null
    }
  },
  request: {
    CREATE: {
      label: 'Tạo mới',
      class: 'badge-soft-success',
      value: 'CREATE'
    },
    UPDATE: {
      label: 'Cập nhật',
      class: 'badge-soft-warning',
      value: 'UPDATE'
    },
    DELETE: {
      label: 'Xoá',
      class: 'badge-soft-danger',
      value: 'DELETE'
    },
    UNKNOWN: {
      label: 'Không xác định',
      class: 'badge-soft-light',
      value: 'UNKNOWN'
    }
  },
  pending: {
    CREATE: {
      label: 'Chờ duyệt thêm',
      class: 'badge-soft-success',
      value: 'CREATE'
    },
    UPDATE: {
      label: 'Chờ duyệt sửa',
      class: 'badge-soft-warning',
      value: 'UPDATE'
    },
    DELETE: {
      label: 'Chờ duyệt xoá',
      class: 'badge-soft-danger',
      value: 'DELETE'
    },
    UNKNOWN: {
      label: 'Không xác định',
      class: 'badge-soft-light',
      value: 'UNKNOWN'
    }
  },
  custom: {}
};

@Component({
  selector: 'app-badge',
  template: `
    <span class="badge font-size-11" [ngClass]="badgeClass">
      {{ badgeLabel }}
    </span>
  `,
  styles: [`
    .badge {
      font-size: 11px;
    }
  `]
})
export class BadgeComponent implements OnInit {
  @Input() value: any;
  @Input() type: BadgeType = 'custom';
  @Input() customConfigs?: BadgeTypeConfig;
  @Input() customLabels?: Record<string, string>;
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';

  badgeLabel: string = '';
  badgeClass: string = '';

  ngOnInit(): void {
    this.updateBadge();
  }

  ngOnChanges(): void {
    this.updateBadge();
  }

  private updateBadge(): void {
    const configs = this.getConfigs();
    const config = this.findMatchingConfig(configs);
    
    if (config) {
      this.badgeLabel = this.customLabels?.[config.label] || config.label;
      this.badgeClass = config.class;
    } else {
      this.badgeLabel = 'Không xác định';
      this.badgeClass = 'badge-soft-light';
    }
  }

  private getConfigs(): BadgeTypeConfig {
    if (this.customConfigs) {
      return this.customConfigs;
    }
    return DEFAULT_CONFIGS[this.type] || DEFAULT_CONFIGS.custom;
  }

  private findMatchingConfig(configs: BadgeTypeConfig): BadgeConfig | null {
    for (const key in configs) {
      const config = configs[key];
      if (this.isValueMatch(config.value)) {
        return config;
      }
    }
    return null;
  }

  private isValueMatch(configValue: any): boolean {
    if (typeof this.value === 'boolean' && typeof configValue === 'boolean') {
      return this.value === configValue;
    }
    if (typeof this.value === 'string' && typeof configValue === 'string') {
      return this.value.toUpperCase() === configValue.toUpperCase();
    }
    return this.value === configValue;
  }
} 
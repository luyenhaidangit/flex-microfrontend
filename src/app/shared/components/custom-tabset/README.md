# Custom Tabset Component

Component tái sử dụng cho việc hiển thị và quản lý tabs một cách linh hoạt và dễ dàng mở rộng.

## Tính năng

- ✅ Hỗ trợ nhiều loại tab (tabs, pills, vertical, justified)
- ✅ Hiển thị icon, badge, count cho mỗi tab
- ✅ Tùy chỉnh style và class
- ✅ Hỗ trợ ẩn/hiện tab động
- ✅ Hỗ trợ vô hiệu hóa tab
- ✅ Responsive và accessible
- ✅ Dễ dàng mở rộng với tab mới

## Cách sử dụng

### 1. Import vào module

```typescript
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SharedModule],
  // ...
})
export class YourModule { }
```

### 2. Sử dụng cơ bản

```html
<app-custom-tabset
  [config]="tabsetConfig"
  [activeTabId]="activeTab"
  (tabChange)="onTabChange($event)"
  (tabClick)="onTabClick($event)">
</app-custom-tabset>
```

### 3. Cấu hình trong component

```typescript
import { TabConfigService } from 'src/app/shared/services/tab-config.service';
import { TabsetConfig } from 'src/app/shared/components/custom-tabset/custom-tabset.component';

export class YourComponent {
  tabsetConfig!: TabsetConfig;

  constructor(private tabConfigService: TabConfigService) {}

  ngOnInit() {
    // Sử dụng service helper
    this.tabsetConfig = this.tabConfigService.createApprovalTabset(
      10, // approved count
      5   // pending count
    );
  }

  onTabChange(tabId: string) {
    console.log('Active tab:', tabId);
  }

  onTabClick(tab: any) {
    console.log('Tab clicked:', tab);
  }
}
```

## Các loại cấu hình có sẵn

### 1. Approval Tabset (Đã duyệt/Chờ duyệt)

```typescript
this.tabsetConfig = this.tabConfigService.createApprovalTabset(
  approvedCount,  // Số lượng đã duyệt
  pendingCount,   // Số lượng chờ duyệt
  {
    pills: true,           // Sử dụng pills style
    showCount: true,       // Hiển thị số lượng
    size: 'md'            // Kích thước tab
  }
);
```

### 2. Status Tabset (Hoạt động/Không hoạt động)

```typescript
this.tabsetConfig = this.tabConfigService.createStatusTabset(
  activeCount,    // Số lượng hoạt động
  inactiveCount,  // Số lượng không hoạt động
  {
    pills: true,
    showCount: true
  }
);
```

### 3. Type Tabset (Tùy chỉnh loại)

```typescript
const types = [
  { id: 'type1', label: 'Loại 1', count: 5, icon: 'bx bx-star' },
  { id: 'type2', label: 'Loại 2', count: 3, icon: 'bx bx-heart' },
  { id: 'type3', label: 'Loại 3', count: 8, icon: 'bx bx-bookmark' }
];

this.tabsetConfig = this.tabConfigService.createTypeTabset(types, {
  pills: true,
  showCount: true
});
```

### 4. Custom Tabset (Tùy chỉnh hoàn toàn)

```typescript
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
    disabled: false,
    hidden: false
  }
];

this.tabsetConfig = this.tabConfigService.createCustomTabset(customTabs, {
  pills: true,
  showCount: true,
  vertical: false,
  justified: true
});
```

## Cập nhật động

### Cập nhật số lượng

```typescript
// Cập nhật số lượng cho tab cụ thể
this.tabsetConfig = this.tabConfigService.updateTabCount(
  this.tabsetConfig,
  'approved',
  newCount
);
```

### Thêm tab mới

```typescript
const newTab = {
  id: 'newTab',
  label: 'Tab mới',
  icon: 'bx bx-plus',
  count: 0
};

this.tabsetConfig = this.tabConfigService.addTab(
  this.tabsetConfig,
  newTab
);
```

### Ẩn/hiện tab

```typescript
// Ẩn tab
this.tabsetConfig = this.tabConfigService.toggleTabVisibility(
  this.tabsetConfig,
  'tabId',
  true // hidden = true
);

// Hiện tab
this.tabsetConfig = this.tabConfigService.toggleTabVisibility(
  this.tabsetConfig,
  'tabId',
  false // hidden = false
);
```

### Vô hiệu hóa/kích hoạt tab

```typescript
// Vô hiệu hóa tab
this.tabsetConfig = this.tabConfigService.toggleTabDisabled(
  this.tabsetConfig,
  'tabId',
  true // disabled = true
);

// Kích hoạt tab
this.tabsetConfig = this.tabConfigService.toggleTabDisabled(
  this.tabsetConfig,
  'tabId',
  false // disabled = false
);
```

## Tùy chỉnh style

### CSS Classes có sẵn

- `.tab-custom-primary` - Màu xanh dương
- `.tab-custom-success` - Màu xanh lá
- `.tab-custom-warning` - Màu vàng
- `.tab-custom-danger` - Màu đỏ

### Tùy chỉnh thêm

```scss
.custom-tabset {
  .nav-link {
    &.active {
      background-color: your-color;
      border-bottom-color: your-color;
    }
  }
}
```

## Events

- `tabChange`: Emit khi tab thay đổi (trả về tabId)
- `tabClick`: Emit khi tab được click (trả về tab object)

## Responsive

Component tự động responsive và hỗ trợ:
- Mobile: Tabs sẽ wrap xuống dòng
- Tablet: Tabs giữ nguyên layout
- Desktop: Tabs hiển thị đầy đủ

## Accessibility

- Hỗ trợ keyboard navigation
- ARIA labels cho screen readers
- Focus management
- Semantic HTML structure

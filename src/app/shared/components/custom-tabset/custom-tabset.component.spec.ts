import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomTabsetComponent, TabConfig, TabsetConfig } from './custom-tabset.component';

describe('CustomTabsetComponent', () => {
  let component: CustomTabsetComponent;
  let fixture: ComponentFixture<CustomTabsetComponent>;

  const mockTabConfig: TabsetConfig = {
    tabs: [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
      { id: 'tab3', label: 'Tab 3', disabled: true }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomTabsetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTabsetComponent);
    component = fixture.componentInstance;
    component.config = mockTabConfig;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with first tab active', () => {
    expect(component.currentActiveTab).toBe('tab1');
  });

  it('should emit tabChange event when tab is clicked', () => {
    spyOn(component.tabChange, 'emit');
    const tab = mockTabConfig.tabs[1];
    
    component.onTabClick(tab);
    
    expect(component.tabChange.emit).toHaveBeenCalledWith('tab2');
    expect(component.currentActiveTab).toBe('tab2');
  });

  it('should not change active tab when disabled tab is clicked', () => {
    const disabledTab = mockTabConfig.tabs[2];
    const originalActiveTab = component.currentActiveTab;
    
    component.onTabClick(disabledTab);
    
    expect(component.currentActiveTab).toBe(originalActiveTab);
  });

  it('should set active tab from input', () => {
    component.activeTabId = 'tab2';
    component.ngOnChanges({ activeTabId: { currentValue: 'tab2', previousValue: 'tab1', firstChange: false, isFirstChange: () => false } });
    
    expect(component.currentActiveTab).toBe('tab2');
  });

  it('should generate correct tab classes', () => {
    const tab = mockTabConfig.tabs[0];
    const classes = component.getTabClasses(tab);
    
    expect(classes).toContain('active');
  });

  it('should generate correct tabset classes', () => {
    const classes = component.getTabsetClasses();
    expect(classes).toContain('nav-tabs');
    expect(classes).toContain('mb-3');
  });

  it('should handle pills configuration', () => {
    component.config.pills = true;
    const classes = component.getTabsetClasses();
    
    expect(classes).toContain('nav-pills');
    expect(classes).not.toContain('nav-tabs');
  });
});

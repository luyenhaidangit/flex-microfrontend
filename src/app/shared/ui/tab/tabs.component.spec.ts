import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabsComponent ],
      imports: [ TabsModule.forRoot() ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default tabs array', () => {
    expect(component.tabs).toEqual([]);
  });

  it('should have default navClass', () => {
    expect(component.navClass).toBe('nav-pills nav-tabs mb-3');
  });

  it('should emit activeIdChange when tab is selected', () => {
    const mockTab = { id: 'test', label: 'Test Tab', icon: 'test-icon' };
    const spy = jest.spyOn(component.activeIdChange, 'emit');
    
    component.onSelect(mockTab);
    
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('should emit changed event when tab is selected', () => {
    const mockTab = { id: 'test', label: 'Test Tab', icon: 'test-icon' };
    const spy = jest.spyOn(component.changed, 'emit');
    
    component.onSelect(mockTab);
    
    expect(spy).toHaveBeenCalledWith(mockTab);
  });

  it('should not emit events when tab is disabled', () => {
    const mockTab = { id: 'test', label: 'Test Tab', icon: 'test-icon', disabled: true };
    const activeIdSpy = jest.spyOn(component.activeIdChange, 'emit');
    const changedSpy = jest.spyOn(component.changed, 'emit');
    
    component.onSelect(mockTab);
    
    expect(activeIdSpy).not.toHaveBeenCalled();
    expect(changedSpy).not.toHaveBeenCalled();
  });
});

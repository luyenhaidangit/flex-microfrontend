import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchComponent } from './branch.component';

describe('DepartmentComponent', () => {
  let component: BranchComponent;
  let fixture: ComponentFixture<BranchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

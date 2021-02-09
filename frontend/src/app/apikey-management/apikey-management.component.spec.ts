import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApikeyManagementComponent } from './apikey-management.component';

describe('ApikeyManagementComponent', () => {
  let component: ApikeyManagementComponent;
  let fixture: ComponentFixture<ApikeyManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApikeyManagementComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApikeyManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgFormComponent } from './org-form.component';

describe('OrgFormComponent', () => {
  let component: OrgFormComponent;
  let fixture: ComponentFixture<OrgFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

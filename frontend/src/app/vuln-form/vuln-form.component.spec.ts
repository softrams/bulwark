import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VulnFormComponent } from './vuln-form.component';

describe('VulnFormComponent', () => {
  let component: VulnFormComponent;
  let fixture: ComponentFixture<VulnFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VulnFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VulnFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

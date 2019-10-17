import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VulnFormComponent } from './vuln-form.component';

describe('VulnFormComponent', () => {
  let component: VulnFormComponent;
  let fixture: ComponentFixture<VulnFormComponent>;

  beforeEach(async(() => {
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

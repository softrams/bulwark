import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailValidateComponent } from './email-validate.component';

describe('EmailValidateComponent', () => {
  let component: EmailValidateComponent;
  let fixture: ComponentFixture<EmailValidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailValidateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailValidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

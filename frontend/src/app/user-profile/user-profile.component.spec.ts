import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserProfileComponent } from './user-profile.component';
import { ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from '../app-routing.module';
import { By } from '@angular/platform-browser';
import { UserService } from '../user.service';

const userService = {
  patchUser: () => {},
};

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      imports: [ReactiveFormsModule, HttpClientModule, AppRoutingModule],
      providers: [{ provide: UserService, useValue: userService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should fail when form is empty', () => {
    expect(component.userForm.valid).toBeFalsy();
  });

  it('it should fail when First Name is not valid', () => {
    const firstName = component.userForm.controls.firstName;
    expect(firstName.valid).toBeFalsy();
  });

  it('it should pass if First Name has errors', () => {
    let errors: ValidationErrors;
    const firstName = component.userForm.controls.firstName;
    errors = firstName.errors || {};
    expect(errors).toBeTruthy();
  });

  it('it should fail when Last Name is not valid', () => {
    const lastName = component.userForm.controls.lastName;
    expect(lastName.valid).toBeFalsy();
  });

  it('it should pass if Last Name has errors', () => {
    let errors: ValidationErrors;
    const lastName = component.userForm.controls.lastName;
    errors = lastName.errors || {};
    expect(errors).toBeTruthy();
  });

  it('it should fail when Title is not valid', () => {
    const title = component.userForm.controls.title;
    expect(title.valid).toBeFalsy();
  });

  it('it should pass if First Name has errors', () => {
    let errors: ValidationErrors;
    const title = component.userForm.controls.title;
    errors = title.errors || {};
    expect(errors).toBeTruthy();
  });

  it('it should pass if On Submit is executed once', () => {
    expect(component.isEdit).toBeFalsy();
    expect(component.userForm.enabled).toBeFalsy();
    const userForm = fixture.debugElement.query(By.css('#userForm'));
    userForm.triggerEventHandler('submit', null);
    expect(component.isEdit).toBeTruthy();
    expect(component.userForm.enabled).toBeTruthy();
  });

  it('it should pass if On Submit is executed twice', () => {
    const mockedUserService = fixture.debugElement.injector.get(UserService);
    spyOn(mockedUserService, 'patchUser');
    expect(component.isEdit).toBeFalsy();
    expect(component.userForm.enabled).toBeFalsy();
    const userForm = fixture.debugElement.query(By.css('#userForm'));
    userForm.triggerEventHandler('submit', null);
    expect(component.isEdit).toBeTruthy();
    expect(component.userForm.enabled).toBeTruthy();
    component.userForm.controls.firstName.setValue('Foo');
    component.userForm.controls.lastName.setValue('Bar');
    component.userForm.controls.title.setValue('Profressor');
    expect(component.userForm.valid).toBeTruthy();
    expect(mockedUserService.patchUser);
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetFormComponent } from './asset-form.component';

describe('AssetFormComponent', () => {
  let component: AssetFormComponent;
  let fixture: ComponentFixture<AssetFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

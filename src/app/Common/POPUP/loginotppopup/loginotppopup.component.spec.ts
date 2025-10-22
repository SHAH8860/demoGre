import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginotppopupComponent } from './loginotppopup.component';

describe('LoginotppopupComponent', () => {
  let component: LoginotppopupComponent;
  let fixture: ComponentFixture<LoginotppopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginotppopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginotppopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

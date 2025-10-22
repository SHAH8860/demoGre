import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpPopUpComponent } from './otp-pop-up.component';

describe('OtpPopUpComponent', () => {
  let component: OtpPopUpComponent;
  let fixture: ComponentFixture<OtpPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtpPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

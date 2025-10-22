import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationGrievenceComponent } from './registration-grievence.component';

describe('RegistrationGrievenceComponent', () => {
  let component: RegistrationGrievenceComponent;
  let fixture: ComponentFixture<RegistrationGrievenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationGrievenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationGrievenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

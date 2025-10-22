import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterGrievanceComponent } from './register-grievance.component';

describe('RegisterGrievanceComponent', () => {
  let component: RegisterGrievanceComponent;
  let fixture: ComponentFixture<RegisterGrievanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterGrievanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterGrievanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

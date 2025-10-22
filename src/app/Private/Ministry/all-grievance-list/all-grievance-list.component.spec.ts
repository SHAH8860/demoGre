import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllGrievanceListComponent } from './all-grievance-list.component';

describe('AllGrievanceListComponent', () => {
  let component: AllGrievanceListComponent;
  let fixture: ComponentFixture<AllGrievanceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllGrievanceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllGrievanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

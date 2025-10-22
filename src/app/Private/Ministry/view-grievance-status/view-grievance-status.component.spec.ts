import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGrievanceStatusComponent } from './view-grievance-status.component';

describe('ViewGrievanceStatusComponent', () => {
  let component: ViewGrievanceStatusComponent;
  let fixture: ComponentFixture<ViewGrievanceStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGrievanceStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewGrievanceStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

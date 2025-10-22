import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGrievenceStatusComponent } from './view-grievence-status.component';

describe('ViewGrievenceStatusComponent', () => {
  let component: ViewGrievenceStatusComponent;
  let fixture: ComponentFixture<ViewGrievenceStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGrievenceStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewGrievenceStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

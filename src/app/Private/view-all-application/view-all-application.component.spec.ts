import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllApplicationComponent } from './view-all-application.component';

describe('ViewAllApplicationComponent', () => {
  let component: ViewAllApplicationComponent;
  let fixture: ComponentFixture<ViewAllApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAllApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

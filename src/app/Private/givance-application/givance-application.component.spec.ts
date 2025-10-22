import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GivanceApplicationComponent } from './givance-application.component';

describe('GivanceApplicationComponent', () => {
  let component: GivanceApplicationComponent;
  let fixture: ComponentFixture<GivanceApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GivanceApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GivanceApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

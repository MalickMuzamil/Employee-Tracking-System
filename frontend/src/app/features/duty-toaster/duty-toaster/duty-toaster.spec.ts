import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyToaster } from './duty-toaster';

describe('DutyToaster', () => {
  let component: DutyToaster;
  let fixture: ComponentFixture<DutyToaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DutyToaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DutyToaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

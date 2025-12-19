import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendaceRecord } from './attendace-record';

describe('AttendaceRecord', () => {
  let component: AttendaceRecord;
  let fixture: ComponentFixture<AttendaceRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendaceRecord]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendaceRecord);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

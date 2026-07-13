import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedEmailPopup } from './received-email-popup';

describe('ReceivedEmailPopup', () => {
  let component: ReceivedEmailPopup;
  let fixture: ComponentFixture<ReceivedEmailPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedEmailPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedEmailPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

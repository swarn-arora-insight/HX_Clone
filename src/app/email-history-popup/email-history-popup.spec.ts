import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailHistoryPopup } from './email-history-popup';

describe('EmailHistoryPopup', () => {
  let component: EmailHistoryPopup;
  let fixture: ComponentFixture<EmailHistoryPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailHistoryPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailHistoryPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

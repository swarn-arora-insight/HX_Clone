import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTemplatePopup } from './email-template-popup';

describe('EmailTemplatePopup', () => {
  let component: EmailTemplatePopup;
  let fixture: ComponentFixture<EmailTemplatePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplatePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTemplatePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

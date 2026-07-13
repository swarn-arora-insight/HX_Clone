import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortlistAgentsDetail } from './shortlist-agents-detail';

describe('ShortlistAgentsDetail', () => {
  let component: ShortlistAgentsDetail;
  let fixture: ComponentFixture<ShortlistAgentsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortlistAgentsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortlistAgentsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

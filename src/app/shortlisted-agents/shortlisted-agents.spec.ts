import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortlistedAgents } from './shortlisted-agents';

describe('ShortlistedAgents', () => {
  let component: ShortlistedAgents;
  let fixture: ComponentFixture<ShortlistedAgents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortlistedAgents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortlistedAgents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

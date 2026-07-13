import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentTable } from './agent-table';

describe('AgentTable', () => {
  let component: AgentTable;
  let fixture: ComponentFixture<AgentTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-agent-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSpinnerComponent],
  templateUrl: './agent-table.html',
  styleUrls: ['./agent-table.css'],
})
export class AgentTable {
  private apiCallingService = inject(ApiService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  @Input() columns: string[] = [];
  @Input() data: any[] = [];
  @Input() selectedFilters: any = {};

  // agent_id is a stable internal identifier used for shortlist matching;
  // it rides along on every row but isn't meaningful to show as a column.
  get displayColumns(): string[] {
    return this.columns.filter(col => col !== 'agent_id');
  }

  // Server-side pagination metadata (provided by the parent).
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 40;
  @Input() totalPages = 0;

  // Events the parent uses to re-fetch from the server.
  @Output() search = new EventEmitter<string>();
  @Output() sort = new EventEmitter<{ sortBy: string; sortDir: 'asc' | 'desc' }>();
  @Output() pageChange = new EventEmitter<number>();

  searchTerm: string = '';
  sortKey: string = '';
  sortAsc: boolean = true;
  private searchDebounce: any = null;

  showAboutPopup = false;
  aboutSummary: string[] = [];
  aboutAgent: any;

  // Cells shown in full (row index + column), keyed as `${rowIndex}_${col}`.
  private expandedCells = new Set<string>();
  private readonly cellTruncateLength = 30;

  isCellTruncatable(value: any): boolean {
    return value != null && String(value).length > this.cellTruncateLength;
  }

  getTruncatedCellValue(value: any): string {
    return String(value).substring(0, this.cellTruncateLength);
  }

  isCellExpanded(rowIndex: number, col: string): boolean {
    return this.expandedCells.has(`${rowIndex}_${col}`);
  }

  toggleCellExpand(rowIndex: number, col: string): void {
    const key = `${rowIndex}_${col}`;
    const wasExpanded = this.expandedCells.has(key);
    this.expandedCells.clear();
    if (!wasExpanded) {
      this.expandedCells.add(key);
    }
  }

  isRowExpanded(rowIndex: number): boolean {
    for (const key of this.expandedCells) {
      if (key.startsWith(`${rowIndex}_`)) return true;
    }
    return false;
  }

  // Debounced search: only hit the server 400ms after the user stops typing.
  onSearchInput(term: string): void {
    this.searchTerm = term;
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.search.emit(this.searchTerm.trim());
    }, 400);
  }

  sortBy(key: string): void {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
    this.sort.emit({ sortBy: this.sortKey, sortDir: this.sortAsc ? 'asc' : 'desc' });
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  // Called by the parent when the underlying dataset/view changes.
  resetControls(): void {
    this.searchTerm = '';
    this.sortKey = '';
    this.sortAsc = true;
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = null;
    }
  }

  // --- Pagination controls ---
  goToPage(p: number): void {
    if (p < 1 || (this.totalPages && p > this.totalPages) || p === this.page) return;
    this.pageChange.emit(p);
  }

  prevPage(): void {
    this.goToPage(this.page - 1);
  }

  nextPage(): void {
    this.goToPage(this.page + 1);
  }

  // Windowed page numbers (max 7 buttons) centered on the current page.
  get pageNumbers(): number[] {
    const maxButtons = 7;
    const pages: number[] = [];
    if (this.totalPages <= 0) return pages;
    let start = Math.max(1, this.page - 3);
    let end = Math.min(this.totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get showingFrom(): number {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  toggleAction(index: number) {
    this.data[index].isSelected = !this.data[index].isSelected;
    this.shortListAgent(this.data[index], this.selectedFilters);
  }

  shortListAgent(agentDetails: any, selectedFilters: any): void {
    let agent_details = {
      agent_id: agentDetails.agent_id,
      Agency: agentDetails.Agency,
      Name: agentDetails.Name,
      isSelected: agentDetails.isSelected
    }
    this.apiCallingService.shortListAgent(agent_details, selectedFilters).subscribe({
      next: (res: any) => {
        if (agentDetails.isSelected) {
          this.toastr.success(`${agentDetails.Name} Shortlisted!`, 'Success');
        } else {
          this.toastr.info(`${agentDetails.Name} Removed from Shortlist!`, 'Info');
        }
      },
    });
  }

  openAboutMe(agentDetails: any) {
    this.spinner.show();
    this.aboutAgent = agentDetails
    let agent_details = {
      Agency: agentDetails.Agency,
      Name: agentDetails.Name,
    }
    this.apiCallingService.aboutAgent(agent_details).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.aboutSummary = res.profile_summary || [];
        this.showAboutPopup = true;
      },
      error: () => {
        this.spinner.hide();
        this.aboutSummary = ["No details available"];
        this.showAboutPopup = true;
      }
    });
  }

  closeAboutMe() {
    this.showAboutPopup = false;
  }

}

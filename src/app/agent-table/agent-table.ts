import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
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

  searchTerm: string = '';
  sortKey: string = '';
  sortAsc: boolean = true;
  showAboutPopup = false;
  aboutSummary: string[] = [];
  aboutAgent: any

  get filteredData() {
    let filtered = this.data;

    // 🔍 Search filter
    if (this.searchTerm.trim()) {
      const lowerTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(lowerTerm)
        )
      );
    }

    // 🔽 Sorting logic
    if (this.sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = String(a[this.sortKey] ?? '').toLowerCase();
        const bVal = String(b[this.sortKey] ?? '').toLowerCase();
        return this.sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return filtered;
  }

  sortBy(key: string) {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
  }

  clearSearch() {
    this.searchTerm = '';
  }

  toggleAction(index: number) {
    this.filteredData[index].isSelected = !this.filteredData[index].isSelected;
    this.shortListAgent(this.filteredData[index], this.selectedFilters);

  }

  shortListAgent(agentDetails: any, selectedFilters: any): void {
    let agent_details = {
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

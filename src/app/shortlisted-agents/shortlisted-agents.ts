import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { ShortlistAgentsDetail } from '../shortlist-agents-detail/shortlist-agents-detail';
import { ApiService } from '../services/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shortlisted-agents',
  imports: [CommonModule, Header, ShortlistAgentsDetail],
  templateUrl: './shortlisted-agents.html',
  styleUrl: './shortlisted-agents.css',
})
export class ShortlistedAgents implements OnInit {

  private router = inject(Router);
  private apiCallingService = inject(ApiService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  @ViewChild('tableSection') tableSection!: ElementRef;

  filteredData = signal<any[]>([]);
  filters: { show: string; value: any }[] = [];
  selectedFilter = signal<any>({ isSelected: true });
  selectedFilterLabel = signal<string>('');

  stats = [
    { label: 'Total Shortlisted', value: 0, colorClass: 'text-primary' },
    { label: 'Pending', value: 0, colorClass: 'text-warning' },
    { label: 'Sent', value: 0, colorClass: 'text-success' },
    { label: 'Received', value: 0, colorClass: 'text-info' }
  ];

  ngOnInit() {
    this.getShortlistCount();
    this.getShortlistFilters();
    this.shortListedDetails();
  }

  selectFilter(filterItem: any) {
    this.selectedFilter.set(filterItem.value);
    this.selectedFilterLabel.set(filterItem.show);
    this.shortListedDetails();
  }

  shortListedDetails(): void {
    this.spinner.show();
    this.apiCallingService.getShortlistedDetails(this.selectedFilter()).subscribe({
      next: (res: any) => {
        if (res) {
          this.filteredData.set(res);
          this.toastr.success('Shortlisted agents loaded successfully!');
          this.spinner.hide();
        }
        this.spinner.hide();
      },
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  scrollToTable() {
    if (this.tableSection) {
      this.tableSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  getShortlistCount(): void {
    this.apiCallingService.getShortlistCounts().subscribe({
      next: (res: any) => {
        this.stats = this.stats.map(stat => ({
          ...stat,
          value: res[stat.label] ?? 0
        }));
      },
    });
  }

  getShortlistFilters(): void {
    this.apiCallingService.getShortlistFilterList().subscribe({
      next: (res: any) => {
        if (res?.filters_map && Array.isArray(res.filters_map)) {

          this.filters = res.filters_map;

          if (this.filters.length > 0) {
            const first = this.filters[0];
            this.selectedFilter.set(first.value);
            this.selectedFilterLabel.set(first.show);
            setTimeout(() => this.scrollToTable(), 300);
          }

        } else {
          this.filters = [];
        }
      },
    });
  }


}

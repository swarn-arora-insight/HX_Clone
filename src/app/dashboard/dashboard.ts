import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AgentTable } from '../agent-table/agent-table';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Header } from '../header/header';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, NgxSpinnerComponent, ToastrModule, AgentTable, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  animations: [
    trigger('expandCollapse', [
      state('void', style({ height: '0', opacity: 0 })),
      state('*', style({ height: '*', opacity: 1 })),
      transition('void <=> *', animate('250ms ease-in-out'))
    ])
  ]
})
export class Dashboard implements OnInit, OnDestroy {
  private apiCallingService = inject(ApiService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private destroy$ = new Subject<void>();

  filters: any[] = [];
  selectedFilters: any = {};
  appliedFilters: any = {};
  columns: string[] = [];
  agents: any[] = [];
  showTable = false;
  isExpanded = true;
  filterValueMap: { [filterName: string]: { [key: string]: string } } = {};

  // --- Server-side pagination / search / sort state (agent details table) ---
  currentPage = 1;
  pageSize = 40;
  totalPages = 0;
  totalRecords = 0;
  searchTerm = '';
  sortBy = '';
  sortDir: 'asc' | 'desc' = 'asc';
  private currentFilterType = '';

  @ViewChild(AgentTable) agentTable!: AgentTable;

  objectKeys(obj: any): string[] {
    return Object.keys(obj).filter(key => key !== 'extra_filter');
  }



  ngOnInit(): void {
    this.getFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePanel(): void {
    this.isExpanded = !this.isExpanded;
  }

  // Fetches filter definitions first, then loads the agent-details table.
  // Chained (rather than fired in parallel) so the spinner shown while
  // getAgentDetails is in flight isn't hidden early by this call finishing first.
  getFilters(): void {
    this.spinner.show();
    (this.apiCallingService.getFilters() as any).subscribe({
      next: (response: any) => {
        if (response?.filters) {
          // `options` on /filter is just a preview (first 100); keep a copy
          // to restore when a filter's search box is cleared, and give each
          // filter its own typeahead stream for server-side searching.
          this.filters = response.filters.map((filter: any) => ({
            ...filter,
            previewOptions: filter.options ?? [],
            typeahead$: new Subject<string>(),
            searching: false,
          }));
          this.filters.forEach((filter: any) => {
            this.mergeFilterValueMap(filter.name, filter.options);
            this.wireFilterSearch(filter);
          });
        }
        this.spinner.hide();
        this.applyFilters();
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Failed to fetch filters', 'Error');
        this.applyFilters();
      },
    });
  }

  // Debounces typed input, then calls /filter/options for that filter;
  // clearing the search box reverts to the original preview list.
  private wireFilterSearch(filter: any): void {
    filter.typeahead$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
          const q = (term || '').trim();
          if (!q) {
            filter.options = filter.previewOptions;
            filter.searching = false;
            return of(null);
          }
          filter.searching = true;
          return this.apiCallingService.getFilterOptions(filter.name, q, 100).pipe(
            catchError(() => of(null))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res: any) => {
        filter.searching = false;
        if (res?.options) {
          filter.options = res.options;
          this.mergeFilterValueMap(filter.name, res.options);
        }
      });
  }

  // Accumulates key->value labels across the initial preview and any
  // search results, so applied-filter chips can label a selected value
  // even after its filter's dropdown has moved on to different options.
  private mergeFilterValueMap(filterName: string, options: { key: string; value: string }[] | undefined): void {
    if (!options) return;
    if (!this.filterValueMap[filterName]) this.filterValueMap[filterName] = {};
    options.forEach(opt => {
      this.filterValueMap[filterName][opt.key] = opt.value;
    });
  }

  applyFilters(): void {
    const payload = Object.keys(this.selectedFilters).length > 0
      ? { ...this.selectedFilters }
      : {};
    this.appliedFilters = { ...payload };
    this.isExpanded = false;

    if (Object.keys(this.selectedFilters).length > 0) {
      this.toastr.success('Filters applied!', 'Success');
    }

    this.getAgentDetails('');
  }

  clearFilters(): void {
    this.selectedFilters = {};
    this.showTable = false;
    this.columns = [];
    this.agents = [];
    this.toastr.info('Filters cleared!', 'Notice');
    this.applyFilters();
  }



  // Entry point when the dataset/view changes (new filters). Resets
  // paging/search/sort to defaults, then fetches page 1.
  getAgentDetails(filterType: string): void {
    this.currentFilterType = filterType;
    this.currentPage = 1;
    this.searchTerm = '';
    this.sortBy = '';
    this.sortDir = 'asc';
    this.agentTable?.resetControls();
    this.fetchAgentDetails(true);
  }

  // Fetches the agent-details page using the current paging/search/sort state.
  private fetchAgentDetails(showToast: boolean = false): void {
    this.selectedFilters['extra_filter'] = this.currentFilterType;
    this.spinner.show();
    this.apiCallingService
      .getAgentDetails(
        this.selectedFilters,
        this.currentPage,
        this.pageSize,
        this.searchTerm,
        this.sortBy,
        this.sortDir
      )
      .subscribe({
        next: (res: any) => {
          this.columns = res.columns;
          this.agents = res.data;
          this.totalRecords = res.total ?? 0;
          this.totalPages = res.total_pages ?? 0;
          this.currentPage = res.page ?? this.currentPage;
          this.showTable = true;

          if (showToast) this.toastr.success('Agent details fetched!', 'Success');
          this.spinner.hide();
        },
        error: () => {
          this.spinner.hide();
          this.toastr.error('Failed to fetch agent details', 'Error');
        },
      });
  }

  // --- Handlers for server-side table events (search / sort / page) ---
  onTableSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.fetchAgentDetails();
  }

  onTableSort(evt: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy = evt.sortBy;
    this.sortDir = evt.sortDir;
    this.currentPage = 1;
    this.fetchAgentDetails();
  }

  onTablePage(page: number): void {
    if (page < 1 || (this.totalPages && page > this.totalPages) || page === this.currentPage) return;
    this.currentPage = page;
    this.fetchAgentDetails();
  }

  shouldDisplayFilter(key: string): boolean {
    const values = this.appliedFilters[key];
    if (!values || !values.length) return false;
    return !values.every((v: string) => v.trim().toLowerCase() === 'n');
  }

  getFilterDisplayValues(key: string): string[] {
    const values = this.appliedFilters[key];
    if (!values || !Array.isArray(values)) return [];
    const map = this.filterValueMap[key] || {};
    return values.map(v => map[v] || v);
  }


}

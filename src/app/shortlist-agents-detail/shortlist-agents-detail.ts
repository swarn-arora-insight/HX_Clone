import { CommonModule } from '@angular/common';
import { Component, inject, input, output, Signal, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { EmailTemplatePopup } from '../email-template-popup/email-template-popup';
import { FormsModule } from '@angular/forms';
import { ReceivedEmailPopup } from '../received-email-popup/received-email-popup';
import { EmailHistoryPopup } from '../email-history-popup/email-history-popup';

@Component({
  selector: 'app-shortlist-agents-detail',
  imports: [CommonModule, NgxSpinnerComponent, EmailTemplatePopup, FormsModule, ReceivedEmailPopup, EmailHistoryPopup],
  templateUrl: './shortlist-agents-detail.html',
  styleUrl: './shortlist-agents-detail.css',
})
export class ShortlistAgentsDetail implements OnChanges {

  private apiCallingService = inject(ApiService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  /** Inputs */
  Filteredagents = input<any>(null);
  selectedFilter = input.required<Signal<any>>();

  /** Outputs */
  refreshList = output<void>();
  agentDeleted = output<void>();

  shortlistedColumns: string[] = [];
  shortlistedData: any[] = [];
  fullShortlistedData: any[] = [];
  emailTemplates: any[] = [];
  showEmailPopup = false;
  showRecivedEmailPopup = false;
  selectedAgent: any = null;
  selectedTemplate: any = null;
  showDeletePopup = false;
  deleteAgent: any = null;
  replyTemplates: any
  receivedDetails: any

  /** Search + Sorting */
  searchTerm = '';
  sortedColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  showEmailHistoryPopup = false;
  selectedEmailHistory: any[] = [];
  showAboutPopup = false;
  aboutSummary: string[] = [];
  aboutAgent: any;



  ngOnChanges(changes: SimpleChanges): void {

    if (changes['Filteredagents']) {
      const res = this.Filteredagents();
      if (res) {
        this.shortlistedColumns = res.columns || [];
        this.shortlistedData = res.data || [];
        this.fullShortlistedData = [...this.shortlistedData];

        // this.shortlistedColumns = res.columns || [];
        // this.shortlistedData = res.data || [];
        // this.fullShortlistedData = [...this.shortlistedData];

        // if (this.shortlistedData.length > 0) {
        //   this.shortlistedData[0].Status = 'Received';
        //   this.fullShortlistedData[0].Status = 'Received';
        // }
      }
    }

    // this.loadEmailTemplates();
    if (this.emailTemplates?.length == 0) {
      this.loadEmailTemps();
    }
    this.loadReplyTemps();
  }

  loadEmailTemplates(): void {
    this.spinner.show();

    this.apiCallingService.getEmailTemplates().subscribe({
      next: (res: any) => {
        this.emailTemplates = res.template_email || [];
        this.spinner.hide();
      },
      error: () => this.spinner.hide()
    });
  }

  clearShortlist(): void {
    this.spinner.show();

    this.apiCallingService.clearShortlist(this.selectedFilter()).subscribe({
      next: () => {
        this.shortlistedData = [];
        this.fullShortlistedData = [];
        this.agentDeleted.emit();
        this.toastr.success('Shortlist cleared!');
        this.spinner.hide();
      },
      error: () => this.spinner.hide()
    });
  }



  beforeDelete(agent: any): void {
    if (agent.Status === 'Pending') {
      this.shortListAgent(agent, '');
    } else {
      this.deleteAgent = agent;
      this.showDeletePopup = true;
    }
  }

  closePopup(): void {
    this.showDeletePopup = false;
    this.deleteAgent = null;
  }

  confirmDelete(): void {
    if (!this.deleteAgent) return;
    this.shortListAgent(this.deleteAgent, '');
    this.closePopup();
  }

  shortListAgent(agent: any, selectedFilters: any): void {
    this.spinner.show();
    agent["isSelected"] = false;
    let agent_details = {
      Agency: agent.Agency,
      Name: agent.Name,
      isSelected: agent.isSelected
    }

    this.apiCallingService.shortListAgent(agent_details, selectedFilters).subscribe({
      next: () => {
        this.toastr.info(`${agent.Name} Removed from Shortlist!`);
        this.refreshList.emit();
        this.agentDeleted.emit();
        this.spinner.hide();
      }
    });
  }

  openEmailPopup(agent: any, template: any) {
    this.selectedAgent = agent;
    this.selectedTemplate = template;
    this.showEmailPopup = true;
  }

  openRecivedEmailPopup() {
    this.showRecivedEmailPopup = true;
  }

  // -------------------------------
  // 🔍 SEARCH FUNCTIONALITY
  // -------------------------------
  filterShortlisted() {
    const term = this.searchTerm.toLowerCase().trim();

    this.shortlistedData = this.fullShortlistedData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );
  }

  // -------------------------------
  // 🔽 SORTING FUNCTIONALITY
  // -------------------------------
  sortColumn(col: string) {
    if (this.sortedColumn === col) {
      // toggle asc <-> desc
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortedColumn = col;
      this.sortDirection = 'asc';
    }

    const dir = this.sortDirection;

    this.shortlistedData.sort((a, b) => {
      const x = (a[col] ?? '').toString().toLowerCase();
      const y = (b[col] ?? '').toString().toLowerCase();

      return dir === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
    });
  }

  loadEmailTemps() {
    this.apiCallingService.getEmailTemplatesList().subscribe({
      next: (res: any) => {
        this.emailTemplates = res.template_names
      }
    })

  }

  loadReplyTemps() {
    this.apiCallingService.getReplyTemplatesList().subscribe({
      next: (res: any) => {
        this.replyTemplates = res.template_names
      }
    })

  }



  handleTemplateClick(agent: any, template: any) {
    this.spinner.show();
    let agent_details = {
      Agency: agent.Agency,
      Name: agent.Name,
      Status: agent.Status
    }
    this.apiCallingService.getEmailTemplateDetails(template, agent_details).subscribe({
      next: (res: any) => {
        const receivedDetails = res.received_email || {};
        const details = res.template_detail || {};
        if (agent.Status === 'Received') {
          // OPEN RECEIVED EMAIL POPUP
          this.selectedAgent = agent;
          this.selectedTemplate = details;
          this.showRecivedEmailPopup = true;
          this.receivedDetails = receivedDetails
        } else {
          // OPEN NORMAL EMAIL TEMPLATE POPUP
          this.selectedAgent = agent;
          this.selectedTemplate = details;
          this.showEmailPopup = true;
        }

        this.spinner.hide();
      },
      error: () => this.spinner.hide()
    });
  }

  openEmailHistory(item: any) {
    this.showEmailHistoryPopup = true;
    this.selectedAgent = item;
    const sampleEmails = [
      {
        message: `Hello {{Name}},\n\nThis is a quick acknowledgment that we have received your message.`,
        recipient: item.Email || 'gloriacurrie@gmail.com',
        sender_email: "Insightscurry.support@gmail.com",
        subject: "We’ve Received Your Message",
        template_name: "Acknowledgment Email"
      },
      {
        message: `Dear Gloria Currie,

I was intrigued by your extensive personal travel experience and your specialization in creating dream vacations. Your knowledge of expedition cruises could be particularly beneficial for my upcoming travel plans. Could we arrange a call to discuss potential itineraries?

Best,
[Your Name]`,
        recipient: item.Email || 'gloriacurrie@gmail.com',
        sender_email: "Insightscurry.support@gmail.com",
        subject: "Proposal for Partnership with Shangri-La World Travel",
        template_name: "Follow Up Message"
      },
      {
        message: `Dear Gloria Currie,

I was intrigued by your extensive personal travel experience and your specialization in creating dream vacations. Your knowledge of expedition cruises could be particularly beneficial for my upcoming travel plans. Could we arrange a call to discuss potential itineraries?

Best,
[Your Name]`,
        recipient: item.Email || 'gloriacurrie@gmail.com',
        sender_email: "Insightscurry.support@gmail.com",
        subject: "Follow Up",
        template_name: "Follow Up Message"
      },
      {
        message: `Dear Gloria Currie,

I was intrigued by your extensive personal travel experience and your specialization in creating dream vacations. Your knowledge of expedition cruises could be particularly beneficial for my upcoming travel plans. Could we arrange a call to discuss potential itineraries?

Best,
[Your Name]`,
        recipient: item.Email || 'gloriacurrie@gmail.com',
        sender_email: "Insightscurry.support@gmail.com",
        subject: "Exploring travel opportunities with Shangri-La World Travel",
        template_name: "Collaboration Opportunity"
      },
      {
        message: `Dear Gloria Currie,

I was intrigued by your extensive personal travel experience and your specialization in creating dream vacations. Your knowledge of expedition cruises could be particularly beneficial for my upcoming travel plans. Could we arrange a call to discuss potential itineraries?

Best,
[Your Name]`,
        recipient: item.Email || 'gloriacurrie@gmail.com',
        sender_email: "Insightscurry.support@gmail.com",
        subject: "Exploring travel opportunities with Shangri-La World Travel",
        template_name: "Collaboration Opportunity"
      },
      {
        message: `Dear Gloria Currie,

I was intrigued by your extensive personal travel experience and your specialization in creating dream vacations. Your knowledge of expedition cruises could be particularly beneficial for my upcoming travel plans. Could we arrange a call to discuss potential itineraries?

Best,
[Your Name]`,
        recipient: item.Email || 'gloriacurrie@gmail.com',
        sender_email: "Insightscurry.support@gmail.com",
        subject: "Next Steps for Our Collaboration",
        template_name: "Follow Up Message"
      }
    ];

    this.selectedEmailHistory = [...sampleEmails].reverse(); // latest first

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

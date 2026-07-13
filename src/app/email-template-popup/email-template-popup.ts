import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-email-template-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-template-popup.html',
  styleUrls: ['./email-template-popup.css'],
})
export class EmailTemplatePopup implements OnInit {
  private toastr = inject(ToastrService);
  @Input() agent: any;
  @Input() template: any;
  @Output() close = new EventEmitter();

  activeTab: 'edit' | 'preview' = 'edit';


  recipient = '';
  subject = '';
  message = '';


  ngOnInit(): void {
    this.bindTemplate();
    document.body.style.overflow = 'hidden';
  }

  bindTemplate() {
    this.recipient = this.template.recipient?.replace('{{Email}}', this.agent.Email);

    this.subject = this.template.subject
      .replace('{{Name}}', this.agent.Name)
      .replace('{{Agency}}', this.agent.Agency);

    this.message = this.template.message
      .replace('{{Name}}', this.agent.Name)
      .replace('{{Agency}}', this.agent.Agency)
      .replace('{{Email}}', this.agent.Email)
      .replace('{{SenderName}}', 'Your Name')
      .replace('{{CompanyName}}', 'Your Company')
      .replace('{{SenderEmail}}', 'support@example.com')
      .replace('{{SenderPhone}}', '9999999999');
  }

  closePopup() {
    document.body.style.overflow = 'auto';
    this.close.emit();
  }

  sendEmail() {
    this.toastr.info("Email service is not configured yet. This is a demo action only.", "Info");

  }
}

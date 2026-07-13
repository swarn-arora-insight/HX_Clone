import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-received-email-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './received-email-popup.html',
  styleUrls: ['./received-email-popup.css']
})
export class ReceivedEmailPopup {

  constructor(private toastr: ToastrService) { }

  @Input() agent: any;
  @Input() template: any;
  @Input() recivedEmail: any;

  @Output() close = new EventEmitter();

  mainTab: string = 'received';
  replyTab: string = 'edit';

  // RECEIVED EMAIL UI FIELDS
  sender: string = '';
  recipient: string = '';
  subject: string = '';
  message: string = '';

  // REPLY UI FIELDS
  replySubject: string = '';
  replyMessage: string = '';
  yourEmail: string = '';

  ngOnInit() {
    this.mapData();
    document.body.style.overflow = 'hidden';
  }

  mapData() {

    // ---------------------------
    // RECEIVED EMAIL BINDING
    // ---------------------------
    this.sender = this.agent?.Name || "Unknown Sender"; // Or use API sender
    this.recipient = this.recivedEmail?.recipient || this.agent?.Email || "";
    this.subject = this.recivedEmail?.subject || "";
    this.message = this.recivedEmail?.message || "";

    // ---------------------------
    // REPLY EMAIL BINDING
    // ---------------------------

    // "Re: <received subject>"
    this.replySubject = "Re: " + (this.recivedEmail?.subject || "");

    // Prepare reply email body (replace placeholders)
    this.replyMessage = this.template?.message || "";
    this.replyMessage = this.replyMessage
      .replace(/{{Name}}/g, this.agent?.Name || "")
      .replace(/{{Email}}/g, this.agent?.Email || "")
      .replace(/{{SenderName}}/g, this.agent?.Name || "")
      .replace(/{{CompanyName}}/g, this.agent?.Agency || "")
      .replace(/{{SenderEmail}}/g, this.template?.sender_email || "")
      .replace(/{{SenderPhone}}/g, "XXXXXXXXXX");

    // Sender email for preview
    this.yourEmail = this.template?.sender_email || "noreply@company.com";
  }

  closePopup() {
    document.body.style.overflow = 'auto';
    this.close.emit();
  }

  switchToReply() {
    if (this.mainTab === 'reply' && this.replyTab === 'preview') {
      this.replyEmail(); return;
    }
    if (this.mainTab === 'reply' && this.replyTab === 'edit') {
      this.setReplyTab('preview');
      return;
    }
    this.mainTab = 'reply';
    this.replyTab = 'edit';
  }
  setReplyTab(tab: string) {
    this.replyTab = tab;
  }
  onMainReplyTabClick() {
    if (this.mainTab === 'reply' && this.replyTab === 'preview') {
      this.replyEmail(); return;
    }

    this.mainTab = 'reply';
    this.replyTab = 'edit';
  }

  replyEmail() {
    this.toastr.info("Reply service is not configured yet. This is a demo action only.", "Info");
  }
}

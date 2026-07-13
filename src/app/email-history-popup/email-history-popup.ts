import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-history-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-history-popup.html',
  styleUrls: ['./email-history-popup.css']
})
export class EmailHistoryPopup {
  @Input() emails: any[] = [];
  @Input() agent: any;
  @Output() close = new EventEmitter();
  expandedIndex: number | null = null;

  ngOnInit() {
    document.body.style.overflow = "hidden";  // block background scroll
  }

  closePopup() {
    document.body.style.overflow = "auto";    // restore scroll
    this.close.emit();
  }

  toggleExpand(i: number) {
    this.expandedIndex = this.expandedIndex === i ? null : i;
  }

}

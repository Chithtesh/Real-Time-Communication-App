import { AfterViewChecked, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/message';
@Component({
  selector: 'app-chat', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-body" #body>
      <p class="text-muted text-center mt-3" *ngIf="messages.length===0">No messages yet. Say hello!</p>
      <div class="chat-msg" *ngFor="let m of messages">
        <div class="meta"><strong>{{ m.senderName }}</strong><span>{{ m.timestamp | date:'shortTime' }}</span></div>
        <div>{{ m.message }}</div>
      </div>
    </div>
    <div class="chat-input">
      <input class="form-control form-control-sm" [(ngModel)]="draft" (keyup.enter)="send()" placeholder="Type a message">
      <button class="btn btn-sm btn-primary" (click)="send()"><i class="fa-solid fa-paper-plane"></i></button>
    </div>`
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @Input() meetingId = '';
  @ViewChild('body') body?: ElementRef;
  messages: Message[] = [];
  draft = '';
  constructor(private chat: ChatService) {}
  ngOnInit(): void { this.chat.history(this.meetingId).subscribe({ next: (r) => (this.messages = r.messages || []), error: () => {} }); }
  send(): void { const t = this.draft.trim(); if (!t) return; this.chat.send(this.meetingId, t); this.draft = ''; }
  addMessage(m: Message): void { this.messages.push(m); }
  ngAfterViewChecked(): void { if (this.body) { const el = this.body.nativeElement; el.scrollTop = el.scrollHeight; } }
}

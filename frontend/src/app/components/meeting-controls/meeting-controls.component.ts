import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-meeting-controls', standalone: true, imports: [CommonModule],
  template: `
    <div class="control-bar">
      <button class="ctrl-btn" [class.danger]="micOff" (click)="toggleMic.emit()" title="Microphone"><i class="fa-solid" [class.fa-microphone]="!micOff" [class.fa-microphone-slash]="micOff"></i></button>
      <button class="ctrl-btn" [class.danger]="camOff" (click)="toggleCam.emit()" title="Camera"><i class="fa-solid" [class.fa-video]="!camOff" [class.fa-video-slash]="camOff"></i></button>
      <button class="ctrl-btn" [class.on]="sharing" (click)="toggleShare.emit()" title="Share screen"><i class="fa-solid fa-desktop"></i></button>
      <button class="ctrl-btn" [class.active]="panel==='chat'" (click)="openPanel.emit('chat')" title="Chat"><i class="fa-solid fa-comments"></i></button>
      <button class="ctrl-btn" [class.active]="panel==='files'" (click)="openPanel.emit('files')" title="Files"><i class="fa-solid fa-folder-open"></i></button>
      <button class="ctrl-btn" [class.active]="panel==='board'" (click)="openPanel.emit('board')" title="Whiteboard"><i class="fa-solid fa-pen-ruler"></i></button>
      <button class="ctrl-btn" [class.active]="panel==='people'" (click)="openPanel.emit('people')" title="Participants"><i class="fa-solid fa-users"></i></button>
      <button class="ctrl-btn danger" (click)="leave.emit()" title="Leave"><i class="fa-solid fa-phone-slash"></i></button>
    </div>`
})
export class MeetingControlsComponent {
  @Input() micOff = false; @Input() camOff = false; @Input() sharing = false; @Input() panel = '';
  @Output() toggleMic = new EventEmitter<void>(); @Output() toggleCam = new EventEmitter<void>();
  @Output() toggleShare = new EventEmitter<void>(); @Output() openPanel = new EventEmitter<string>(); @Output() leave = new EventEmitter<void>();
}

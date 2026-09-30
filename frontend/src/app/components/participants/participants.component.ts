import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-participants', standalone: true, imports: [CommonModule],
  template: `
    <div class="p-3">
      <h6 class="mb-3"><i class="fa-solid fa-users me-2"></i>Participants ({{ participants.length }})</h6>
      <div class="participant-row" *ngFor="let p of participants">
        <span><i class="fa-solid fa-circle-user me-2"></i>{{ p.name }}<span class="text-muted" *ngIf="p.isLocal"> (You)</span></span>
        <span><i class="fa-solid me-2" [class.fa-microphone]="!p.micOff" [class.fa-microphone-slash]="p.micOff" [class.mic-off]="p.micOff"></i><i class="fa-solid" [class.fa-video]="!p.camOff" [class.fa-video-slash]="p.camOff" [class.mic-off]="p.camOff"></i></span>
      </div>
    </div>`
})
export class ParticipantsComponent { @Input() participants: any[] = []; }

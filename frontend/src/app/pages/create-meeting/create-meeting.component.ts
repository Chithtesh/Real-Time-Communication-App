import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MeetingService } from '../../services/meeting.service';
import { ToastService } from '../../services/toast.service';
import { Meeting } from '../../models/meeting';

@Component({ selector: 'app-create-meeting', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './create-meeting.component.html' })
export class CreateMeetingComponent {
  title = ''; meeting: Meeting | null = null; loading = false;
  constructor(private svc: MeetingService, private toast: ToastService, private router: Router) {}
  create(): void { this.loading = true; this.svc.create(this.title).subscribe({ next: (res) => { this.meeting = res.meeting; this.loading = false; }, error: () => { this.loading = false; this.toast.error('Could not create meeting'); } }); }
  get link(): string { return this.meeting ? location.origin + '/meeting/' + this.meeting.meetingId : ''; }
  copy(): void { if (this.meeting) { navigator.clipboard.writeText(this.meeting.meetingId).then(() => this.toast.success('Meeting ID copied')); } }
  copyLink(): void { navigator.clipboard.writeText(this.link).then(() => this.toast.success('Link copied')); }
  start(): void { if (this.meeting) { this.router.navigate(['/meeting', this.meeting.meetingId]); } }
}

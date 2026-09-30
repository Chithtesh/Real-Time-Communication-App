import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MeetingService } from '../../services/meeting.service';
import { ToastService } from '../../services/toast.service';

@Component({ selector: 'app-join-meeting', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './join-meeting.component.html' })
export class JoinMeetingComponent {
  meetingId = '';
  error = '';
  loading = false;
  constructor(private svc: MeetingService, private router: Router, private toast: ToastService) {}
  join(): void {
    this.error = '';
    const id = this.meetingId.trim().toUpperCase();
    if (!id) { this.error = 'Please enter a meeting ID.'; return; }
    this.loading = true;
    this.svc.get(id).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/meeting', id]); },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Meeting not found. Check the ID and try again.'; },
    });
  }
}

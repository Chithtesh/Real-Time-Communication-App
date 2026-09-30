import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MeetingService } from '../../services/meeting.service';
import { Meeting } from '../../models/meeting';

@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit {
  meetings: Meeting[] = [];
  loading = false;
  user = this.auth.currentUser();
  constructor(private auth: AuthService, private meetingsSvc: MeetingService, private router: Router) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.meetingsSvc.list().subscribe({ next: (res) => { this.meetings = res.meetings || []; this.loading = false; }, error: () => { this.loading = false; } }); }
  create(): void { this.router.navigate(['/create-meeting']); }
  join(): void { this.router.navigate(['/join-meeting']); }
  open(m: Meeting): void { this.router.navigate(['/meeting', m.meetingId]); }
  fmt(d?: string): string { return d ? new Date(d).toLocaleString() : '-'; }
}

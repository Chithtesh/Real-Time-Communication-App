import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-home', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './home.component.html' })
export class HomeComponent {
  features = [
    { icon: 'fa-solid fa-video', title: 'HD Video Calling', desc: 'Multi-user video and audio calls powered by WebRTC with encrypted media transport.' },
    { icon: 'fa-solid fa-desktop', title: 'Screen Sharing', desc: 'Share your screen, a window or a browser tab with one click.' },
    { icon: 'fa-solid fa-comments', title: 'Real-Time Chat', desc: 'Instant in-meeting messaging for every participant.' },
    { icon: 'fa-solid fa-folder-open', title: 'File Sharing', desc: 'Upload and download documents and media during a meeting.' },
    { icon: 'fa-solid fa-pen-ruler', title: 'Collaborative Whiteboard', desc: 'Draw together in real time on a shared canvas.' },
    { icon: 'fa-solid fa-shield-halved', title: 'Secure Communication', desc: 'JWT authentication, bcrypt hashing and hardened HTTP headers.' },
  ];
  constructor(public auth: AuthService, private router: Router) {}
  startMeeting(): void { this.router.navigate([this.auth.isLoggedIn() ? '/create-meeting' : '/login']); }
  joinMeeting(): void { this.router.navigate([this.auth.isLoggedIn() ? '/join-meeting' : '/login']); }
}

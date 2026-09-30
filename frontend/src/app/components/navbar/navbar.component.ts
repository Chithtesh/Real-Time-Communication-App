import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  collapsed = true;
  constructor(public auth: AuthService, private router: Router, private socket: SocketService) {}

  toggle(): void { this.collapsed = !this.collapsed; }

  logout(): void {
    this.socket.disconnect();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

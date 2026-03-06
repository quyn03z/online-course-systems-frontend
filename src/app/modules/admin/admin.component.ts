import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent {
  sidebarToggled = false;

  constructor(public authService: AuthService) { }

  toggleSidebar() {
    this.sidebarToggled = !this.sidebarToggled;
  }
}

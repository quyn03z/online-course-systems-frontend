import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.scss'
})
export class TeacherComponent {
  sidebarToggled = false;
  dropdownOpen = false;
  authService = inject(AuthService);

  toggleSidebar() {
    this.sidebarToggled = !this.sidebarToggled;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}

import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  mobileNavOpen = false;
  dropdownOpen = false;

  constructor(public authService: AuthService) { }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-avatar-wrapper')) {
      this.dropdownOpen = false;
    }
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
    document.body.classList.toggle('mobile-nav-active', this.mobileNavOpen);
  }
}

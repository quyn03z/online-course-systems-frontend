import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied-401',
  standalone: true,
  imports: [],
  templateUrl: './access-denied-401.component.html',
  styleUrl: './access-denied-401.component.scss'
})
export class AccessDenied401Component {
  constructor(private router: Router) { }

  goToHome() {
    this.router.navigate(['/home']);
  }
}

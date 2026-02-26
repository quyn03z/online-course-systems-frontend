import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  email = "quyenvn03@gmail.com";
  phone = "+84 987 654 321";
  address = "Hoài Đức Hà Nội";
  country = "Việt Nam";
}

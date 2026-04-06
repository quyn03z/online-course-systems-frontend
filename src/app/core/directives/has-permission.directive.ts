import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input('appHasPermission') permission!: string;

  constructor() {
    // Sử dụng effect để tự động re-render khi currentUser signal thay đổi
    effect(() => {
      this.updateView();
    });
  }

  private updateView() {
    if (this.authService.hasPermission(this.permission)) {
      // check hiển thị nút
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}

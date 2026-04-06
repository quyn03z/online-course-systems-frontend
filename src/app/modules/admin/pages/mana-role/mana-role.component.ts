import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { NotifyApiError, NotifyError, NotifySuccess } from '../../../../core/utils/notification.util';

export interface Role {
  id: number;
  roleName: string;
}


export interface Permission {
  id: number;
  name: string;
  displayName: string;
}


@Component({
  selector: 'app-mana-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mana-role.component.html',
  styleUrl: './mana-role.component.scss'
})
export class ManaRoleComponent implements OnInit {

  private adminService = inject(AdminService);
  roles: Role[] = [];
  loading = true;
  error: string | null = null;
  permissions: Permission[] = [];
  
  // Modal properties
  newRole: Role = { id: 0, roleName: '' };
  isEditMode = false;

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.adminService.getAllRoles().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.roles = response.result;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'An error occurred while fetching roles';
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.newRole = { id: 0, roleName: '' };
  }

  openEditModal(role: Role): void {
    this.isEditMode = true;
    this.newRole = { ...role };
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loading = true;
    this.adminService.getAllPermissions().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.permissions = response.result;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'An error occurred while fetching permissions';
        this.loading = false;
      }
    });
  }


  submitRole(): void {
    if (!this.newRole.roleName.trim()) return;

    if (this.isEditMode) {
      this.adminService.updateRole(this.newRole, this.newRole.id).subscribe({
        next: (res) => {
          if (res.succeeded) {
            NotifySuccess('Hệ thống đã cập nhật Role thành công');
            this.loadRoles();
            this.closeModal('roleModal');
          } else {
            NotifyError(res.errors.join(', '));
          }
        },
        error: (err) => NotifyApiError(err)
      });
    } else {
      this.adminService.createRole(this.newRole).subscribe({
        next: (res) => {
          if (res.succeeded) {
            NotifySuccess('Hệ thống đã tạo Role mới thành công');
            this.loadRoles();
            this.closeModal('roleModal');
          } else {
            NotifyError(res.errors.join(', '));
          }
        },
        error: (err) => NotifyApiError(err)
      });
    }
  }

  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      closeButton?.click();
    }
  }

  deleteRole(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa Role này không?')) {
      this.adminService.deleteRole(id).subscribe({
        next: (res) => {
          if (res.succeeded) {
            NotifySuccess('Xóa Role thành công');
            this.loadRoles();
          } else {
            NotifyError(res.errors.join(', '));
          }
        },
        error: (err) => NotifyApiError(err)
      });
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.scss'
})
export class ManageUserComponent implements OnInit {
  users: any[] = [];

  private adminService = inject(AdminService);

  isLoading = false;
  errorMessage = '';

  // Modal
  showModal = false;
  selectedUser: any = {};

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res.result.items;
        console.log(this.users);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  onEditUser(user: any) {
    this.selectedUser = { ...user };
    if (this.selectedUser.roleName === 'Admin') {
      this.selectedUser.roleId = 1;
    } else if (this.selectedUser.roleName === 'Teacher') {
      this.selectedUser.roleId = 2;
    } else if (this.selectedUser.roleName === 'Student') {
      this.selectedUser.roleId = 3;
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSaveUser() {
    this.adminService.updateUser(this.selectedUser).subscribe({
      next: (res) => {
        console.log(res);
        this.getAllUsers();
      },
      error: (err) => {
        console.log(err);
      }
    })
    this.closeModal();
  }

  searchTerm = '';
  pageSize = 10;
  currentPage = 1;

  get filteredUsers() {
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(e =>
      e.username.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term)
    );
  }

  get pagedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  minVal(a: number, b: number) { return Math.min(a, b); }
}

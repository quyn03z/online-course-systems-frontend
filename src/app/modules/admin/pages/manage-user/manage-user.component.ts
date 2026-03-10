import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { NotifySuccess, NotifyError, NotifyApiError } from '../../../../core/utils/notification.util';

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

  // Modal chỉnh sửa
  showModal = false;
  selectedUser: any = {};

  // Modal thêm mới
  showModalAdd = false;
  newUser: any = {
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    roleId: 3,
    isLocked: false
  };

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    this.adminService.getAllUsers(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        this.users = res.result.items;
        this.totalItems = res.result.totalItems;
        this.totalPages = res.result.totalPages;
      },
      error: (err) => {
        console.log(err.error.message);
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

  openModalAdd() {
    this.newUser = { userName: '', email: '', firstName: '', lastName: '', roleId: 3, isLocked: false };
    this.showModalAdd = true;
  }

  closeModal() {
    this.showModal = false;
  }

  closeModalAdd() {
    this.showModalAdd = false;
  }

  onCreateUser() {
    const payload = {
      userName: this.newUser.userName,
      email: this.newUser.email,
      firstName: this.newUser.firstName,
      lastName: this.newUser.lastName,
      roleId: Number(this.newUser.roleId),
      isLocked: this.newUser.isLocked
    };
    this.adminService.createUser(payload).subscribe({
      next: (res: any) => {
        console.log(res);
        NotifySuccess('Thêm người dùng thành công!');
        this.getAllUsers();
        this.closeModalAdd();
      },
      error: (err: any) => {
        console.log(err);
        NotifyError(err.error.message);
      }
    });
  }

  onSaveUser() {
    const payload = {
      userId: this.selectedUser.id,
      email: this.selectedUser.email,
      firstName: this.selectedUser.firstname,
      lastName: this.selectedUser.lastname,
      roleId: Number(this.selectedUser.roleId),
      isLocked: this.selectedUser.isLocked
    };
    this.adminService.updateUser(payload).subscribe({
      next: (res) => {
        console.log(res);
        NotifySuccess('Cập nhật thông tin người dùng thành công!');
        this.getAllUsers();
      },
      error: (err) => {
        console.log(err);
        NotifyError(err.error.message);
      }
    })
    this.closeModal();
  }

  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 1;

  onSearch() {
    this.currentPage = 1;
    this.getAllUsers();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.getAllUsers();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllUsers();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getAllUsers();
    }
  }

  get showingFrom() { return (this.currentPage - 1) * this.pageSize + 1; }
  get showingTo() { return Math.min(this.currentPage * this.pageSize, this.totalItems); }

  minVal(a: number, b: number) { return Math.min(a, b); }
}

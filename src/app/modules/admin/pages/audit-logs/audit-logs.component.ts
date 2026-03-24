import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLog } from '../../../../core/services/audit-log.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-audit-logs',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './audit-logs.component.html',
    styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit, OnDestroy {
    logs: AuditLog[] = [];
    totalCount: number = 0;
    currentPage: number = 1;
    pageSize: number = 10;
    loading: boolean = false;
    searchTerm: string = '';
    startDate: string = '';
    endDate: string = '';
    selectedLog: AuditLog | null = null;
    Math = Math;

    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(private auditLogService: AuditLogService) { }

    ngOnInit(): void {
        this.loadLogs();

        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(term => {
            this.searchTerm = term;
            this.currentPage = 1;
            this.loadLogs();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadLogs(): void {
        this.loading = true;
        const start = this.startDate ? new Date(this.startDate) : null;
        const end = this.endDate ? new Date(this.endDate) : null;

        this.auditLogService.getAuditLogs(this.currentPage, this.pageSize, this.searchTerm, start, end).subscribe({
            next: (response) => {
                if (response.succeeded) {
                    console.log(response.result);
                    this.logs = response.result.logs;
                    this.totalCount = response.result.totalCount;
                }
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Error loading audit logs', err);
                this.loading = false;
            }
        });
    }

    onSearch(event: any): void {
        const term = event.target.value;
        this.searchSubject.next(term);
    }

    onDateChange(): void {
        this.currentPage = 1;
        this.loadLogs();
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadLogs();
    }

    viewDetails(log: AuditLog): void {
        this.selectedLog = log;
    }

    closeModal(): void {
        this.selectedLog = null;
    }

    deleteLog(id: number): void {
        if (confirm('Bạn có chắc chắn muốn xóa bản ghi audit này không?')) {
            this.auditLogService.deleteAuditLog(id).subscribe({
                next: (res) => {
                    if (res.succeeded) {
                        this.loadLogs();
                    }
                },
                error: (err) => console.error('Error deleting log', err)
            });
        }
    }
}

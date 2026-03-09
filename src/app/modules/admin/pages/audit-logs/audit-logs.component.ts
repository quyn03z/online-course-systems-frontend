import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService, AuditLog, AuditLogResponse, ResultResponse } from '../../../../core/services/audit-log.service';

@Component({
    selector: 'app-audit-logs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './audit-logs.component.html',
    styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit {
    logs: AuditLog[] = [];
    totalCount: number = 0;
    currentPage: number = 1;
    pageSize: number = 10;
    loading: boolean = false;
    Math = Math;

    constructor(private auditLogService: AuditLogService) { }

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs(): void {
        this.loading = true;
        this.auditLogService.getAuditLogs(this.currentPage, this.pageSize).subscribe({
            next: (response: ResultResponse<AuditLogResponse>) => {
                if (response.succeeded) {
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

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadLogs();
    }

    getPages(): number[] {
        const totalPages = Math.ceil(this.totalCount / this.pageSize);
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
}

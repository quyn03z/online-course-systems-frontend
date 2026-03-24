import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface ResultResponse<T> {
    succeeded: boolean;
    result: T;
    errors: string[];
}

export interface AuditLogChange {
    propertyName: string;
    oldValue: string;
    newValue: string;
}

export interface AuditLog {
    auditLogId: number;
    userId: number;
    action?: string;
    entity: string;
    oldValues: string;
    newValues: string;
    keyValues: string;
    createdAt: string;
    user?: {
        userName: string;
        email: string;
    };
    changes: AuditLogChange[];
    ipAddress?: string;
    userAgent?: string;
    durationMs?: number;
}

export interface AuditLogResponse {
    logs: AuditLog[];
    totalCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuditLogService {
    private apiService = inject(ApiService);

    getAuditLogs(page: number = 1, pageSize: number = 10, search: string = '', startDate: Date | null = null, endDate: Date | null = null): Observable<ResultResponse<AuditLogResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (search) {
            params = params.set('search', search);
        }
        if (startDate) {
            params = params.set('startDate', startDate.toISOString());
        }
        if (endDate) {
            params = params.set('endDate', endDate.toISOString());
        }

        return this.apiService.get<ResultResponse<AuditLogResponse>>('AuditLogs', params);
    }

    deleteAuditLog(id: number): Observable<ResultResponse<string>> {
        return this.apiService.delete<ResultResponse<string>>(`AuditLogs/${id}`);
    }
}

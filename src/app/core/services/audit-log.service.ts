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
    action: string;
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

    getAuditLogs(page: number = 1, pageSize: number = 10): Observable<ResultResponse<AuditLogResponse>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        return this.apiService.get<ResultResponse<AuditLogResponse>>('AuditLogs', params);
    }
}

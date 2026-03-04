import { alert as pAlert, success as pSuccess, error as pError, info as pInfo } from '@pnotify/core';

const DEFAULT_DELAY = 5000;

export const NotifySuccess = (text: string, title = 'Thành công!'): void => {
    pSuccess({ title, text, delay: DEFAULT_DELAY });
};

export const NotifyError = (text: string, title = 'Lỗi!'): void => {
    pError({ title, text, delay: DEFAULT_DELAY });
};

export const NotifyInfo = (text: string, title = 'Thông báo'): void => {
    pInfo({ title, text, delay: DEFAULT_DELAY });
};

export const NotifyAlert = (text: string, title = 'Cảnh báo!'): void => {
    pAlert({ title, text, delay: DEFAULT_DELAY });
};

/**
 * Đọc lỗi từ ApiResult.Failure hoặc exception message
 * Hỗ trợ cả 2 format:
 *   - ApiResult: { errors: string[] }
 *   - Exception: { message: string }
 */
export const getApiErrorMessage = (err: any, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string => {
    if (err?.error?.errors) {
        const errors = err.error.errors;
        // ApiResult format: errors là array
        if (Array.isArray(errors)) {
            return errors.join('\n');
        }
        // ProblemDetails format: errors là object { Field: [msg] }
        if (typeof errors === 'object') {
            return Object.values(errors).flat().join('\n');
        }
    }
    return err?.error?.message || fallback;
};

/**
 * Hiện lỗi từ API response trực tiếp
 */
export const NotifyApiError = (err: any, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): void => {
    NotifyError(getApiErrorMessage(err, fallback));
};

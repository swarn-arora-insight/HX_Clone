import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const appInterceptor: HttpInterceptorFn = (req, next) => {
    const toastr = inject(ToastrService);
    const router = inject(Router);
    const token = localStorage.getItem('token');

    let modifiedReq = req;

    // ✅ Skip login request (don’t attach token)
    const isLoginRequest = req.url.includes('/login');

    // ✅ For POST/PUT/PATCH — add token in body
    if (token && !isLoginRequest && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const bodyWithToken = { ...(req.body || {}), token: token };
        modifiedReq = req.clone({ body: bodyWithToken });
    }

    // ✅ For GET — optionally add token as query param if backend needs it
    // Uncomment if required:
    /*
    if (token && !isLoginRequest && req.method === 'GET') {
        const paramsWithToken = req.params.set('token', token);
        modifiedReq = req.clone({ params: paramsWithToken });
    }
    */

    // ✅ Handle errors globally
    return next(modifiedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            let message = 'An unexpected error occurred';
            let title = 'Error';
            let showToast = true;

            if (error.error instanceof ErrorEvent) {
                message = `Network Error: ${error.error.message}`;
                title = 'Connection Problem';
            } else {
                switch (error.status) {
                    case 0:
                        message = 'Network error. Please check your internet connection.';
                        title = 'Connection Issue';
                        break;
                    case 400:
                        message = error.error?.message ?? 'Invalid request. Please verify input data.';
                        title = 'Bad Request';
                        break;
                    case 401:
                        message = 'Your session has expired. Please login again.';
                        title = 'Unauthorized';
                        showToast = true;

                        localStorage.removeItem('token');
                        localStorage.removeItem('loggedIn');
                        setTimeout(() => router.navigate(['/']), 3500);
                        break;
                    case 403:
                        message = 'You do not have permission to perform this action.';
                        title = 'Access Denied';
                        break;
                    case 404:
                        message = error.error?.message ?? 'Requested resource was not found.';
                        break;
                    case 429:
                        message = 'Too many requests. Please wait and try again.';
                        title = 'Rate Limited';
                        break;
                    case 500:
                        message = 'Internal server error.';
                        title = 'Server Error';
                        break;
                    case 503:
                        message = 'Service temporarily unavailable. Try again later.';
                        title = 'Service Unavailable';
                        break;
                    default:
                        message = error.error?.message ?? `HTTP ${error.status}: ${error.message}`;
                        title = 'API Error';
                }
            }

            const silentUrls = ['/api/silent-endpoint'];
            if (!silentUrls.some(url => req.url.includes(url)) && showToast) {
                toastr.error(message, title, {
                    timeOut: 4000,
                    progressBar: true,
                    closeButton: true,
                    positionClass: 'toast-top-right'
                });
            }

            console.error('HTTP Error:', {
                url: req.url,
                status: error.status,
                message: error.message,
                error: error.error
            });

            return throwError(() => error);
        })
    );
};

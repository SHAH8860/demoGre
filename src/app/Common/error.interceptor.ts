import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('[Interceptor] Error:', error);

      if (error.status === 431) {
        console.warn('431 Detected - clearing cookies');
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }

      if (error.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        router.navigate(['/home']);
      }

      return throwError(() => error);
    })
  );
};

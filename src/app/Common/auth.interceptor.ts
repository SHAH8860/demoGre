import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 400) {
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




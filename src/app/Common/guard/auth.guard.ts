
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const token = sessionStorage.getItem('token');
  const userModule = sessionStorage.getItem('userModule');
  const router = inject(Router);

  if (!token) {
    router.navigate(['/home']);
    return false;
  }
  const url = state.url;

  if (
    (url.startsWith('/dashBoard') || url.startsWith('/grivance')) && userModule !== 'applicant'
  ) {
    router.navigate(['/home']); 
    localStorage.clear();
    sessionStorage.clear();
    return false;
  }

  if (
    url.startsWith('/institute-dashBoard') && userModule !== 'institute'
  ) {
    router.navigate(['/home']);
    localStorage.clear();
    sessionStorage.clear();
    return false;
  }

  if (
    url.startsWith('/ministry-dashBoard') && userModule !== 'ministry'
  ) {
    router.navigate(['/home']);
    localStorage.clear();
    sessionStorage.clear();
    return false;
  }

  return true;
};

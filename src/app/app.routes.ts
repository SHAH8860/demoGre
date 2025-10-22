import { Routes } from '@angular/router';
import { authGuard } from './Common/guard/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./Public/home-page/home-page.component').then(
        (comp) => comp.HomePageComponent
      ),
  },
  {
    path: 'login-applicant',
    loadComponent: () =>
      import('./Public/login-page/login-page.component').then(
        (comp) => comp.LoginPageComponent
      ),
  },
  {
    path: 'login-institute',
    loadComponent: () => import('../app/Public/institute-login/institute-login.component').then((comp) => comp.InstituteLoginComponent)
  },
  {
    path: 'login-ministry',
    loadComponent: () => import('../app/Public/ministry-login/ministry-login.component').then((comp) => comp.MinistryLoginComponent)
  },
  {
    path: 'grivance',
    loadComponent: () =>
      import(
        './Private/givance-application/givance-application.component'
      ).then((comp) => comp.GivanceApplicationComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'allApplication', pathMatch: 'full' },
      {
        path: 'allApplication',
        loadComponent: () =>
          import(
            './Private/view-all-application/view-all-application.component'
          ).then((comp) => comp.ViewAllApplicationComponent),
        canActivate: [authGuard]
      },
    ],
  },
  {
    path: 'dashBoard',
    loadComponent: () =>
      import('./Private/dashboard/dashboard.component').then(
        (comp) => comp.DashboardComponent
      ),
    canActivate: [authGuard],

    children: [
      {
        path: 'grievanceStatus',
        loadComponent: () =>
          import(
            './Private/view-grievence-status/view-grievence-status.component'
          ).then((comp) => comp.ViewGrievenceStatusComponent),
        canActivate: [authGuard]
      },
      {
        path: 'grivanceRegistration',
        loadComponent: () =>
          import(
            './Private/registration-grievence/registration-grievence.component'
          ).then((comp) => comp.RegistrationGrievenceComponent),
        canActivate: [authGuard]
      },
      {
        path: 'allGrivenceList',
        loadComponent: () =>
          import(
            './Private/all-grievance-list/all-grievance-list.component'
          ).then((comp) => comp.AllGrievanceListComponent),
        canActivate: [authGuard]
      },
    ],
  },






  // institute routing




  {
    path: 'institute-dashBoard',
    loadComponent: () =>
      import('./Private/Institute/institute-dashboard/dashboard.component').then(
        (comp) => comp.DashboardComponent
      ),
    canActivate: [authGuard],

    children: [
      {
        path: '',
        redirectTo: 'institute-grievance-status',
        pathMatch: 'full'
      },
      {
        path: 'institute-grievance-status',
        loadComponent: () =>
          import(
            './Private/Institute/view-grievance-status/view-grievance-status.component'
          ).then((comp) => comp.ViewGrievanceStatusComponent),
        canActivate: [authGuard]
      },
      {
        path: 'institute-grivance-registration',
        loadComponent: () =>
          import(
            './Private/Institute/register-grievance/register-grievance.component'
          ).then((comp) => comp.RegisterGrievanceComponent),
        canActivate: [authGuard]
      },
      {
        path: 'institute-all-grivenceList',
        loadComponent: () =>
          import(
            './Private/Institute/all-grievance-list/all-grievance-list.component'
          ).then((comp) => comp.AllGrievanceListComponent),
        canActivate: [authGuard]
      },
    ],
  },



  //  ministry routing





  {
    path: 'ministry-dashBoard',
    loadComponent: () =>
      import('./Private/Ministry/ministry-dashboard/dashboard.component').then(
        (comp) => comp.DashboardComponent
      ),
    canActivate: [authGuard],

    children: [
      {
        path: '',
        redirectTo: 'ministry-grivance-registration',
        pathMatch: 'full'
      },
      {
        path: 'ministry-grievance-status',
        loadComponent: () =>
          import(
            './Private/Ministry/view-grievance-status/view-grievance-status.component'
          ).then((comp) => comp.ViewGrievanceStatusComponent),
        canActivate: [authGuard]
      },
      {
        path: 'ministry-grivance-registration',
        loadComponent: () =>
          import(
            './Private/Ministry/register-grievance/register-grievance.component'
          ).then((comp) => comp.RegisterGrievanceComponent),
        canActivate: [authGuard]
      },
      {
        path: 'ministry-all-grivenceList',
        loadComponent: () =>
          import(
            './Private/Ministry/all-grievance-list/all-grievance-list.component'
          ).then((comp) => comp.AllGrievanceListComponent),
        canActivate: [authGuard]
      },
    ],
  },

  {path:'page-not-found',loadComponent:()=>import('./Common/errorPage/errorpage/errorpage.component').then((comp)=>comp.ErrorpageComponent)},
  {
    path: '**',
    redirectTo: 'home'
  },
];

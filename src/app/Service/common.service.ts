import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { LoaderService } from './loader.service';
import { AlertService } from './alert.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  GrievanceDetailsAndStatus = new BehaviorSubject<any[]>([]);
  public tokenSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('token'));
  token$ = this.tokenSubject.asObservable();
  constructor(private http: HttpClient,private _loader:LoaderService,private _alert:AlertService,private router: Router) { }

  setToken(token: string | null) {
    this.tokenSubject.next(token);  
  }
  removeToken(){
    this.tokenSubject.next(null);

  }

  errorLogging() {
    this._loader.hideLoader();
    localStorage.clear();
    sessionStorage.clear();
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.tokenSubject.next(null);
    this._alert.swalPopError('Session Timeout.Login again');
    setTimeout(() => {
      this.router.navigateByUrl('/home');
    }, 2000);
  }

  getSaltForOtr()  {
    return this.http.get(`${environment.grievanceApiUrl}auth/getSaltForOTR`);
  }
  getSaltForApplicationId() {
    return this.http.get(`${environment.grievanceApiUrl}auth/getSaltForApplicationId`);
  }
  getImageCaptcha()  {
    return this.http.get(`${environment.grievanceApiUrl}auth/imageCaptcha`);
  }
  loginUser(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}auth/login`, data);
  }
  getAllApplication(data: any)  {
    return this.http.post(
      `${environment.grievanceApiUrl}v2/getApplicationsListUsingOTRId`,
      { data: data }
    );
  }

  //register
  registerStudentGrievance(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}v2/saveStudentGrievance`, {
      data: data,
    });
  }

  getState()  {
    return this.http.get(`${environment.grievanceApiUrl}v2/master/getStateList`);
  }
  getDistrictListUsingStateId(data:any){
    return this.http.get(`${environment.grievanceApiUrl}v2/master/getDistrictListUsingStateId?stateId=${data}`);

  }

  getMinistriesList()  {
    return this.http.get(`${environment.grievanceApiUrl}v2/master/getMinistriesList`);
  }

  getMinistrySchemeList(event: any)  {
    return this.http.get(`${environment.grievanceApiUrl}v2/master/getSchemeListUsingMinistryId?ministryId=${event}`);
  }

  getAllGrievanceList(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}v2/getAllGrievanceList`, { data: data })
  }


  getStudentMainIssueCetrgoryList()  {
    return this.http.get(`${environment.grievanceApiUrl}v2/master/getStudentMainIssueCetrgoryList`);
  }

  getStudentSubIssueCetrgoryList(event: any)  {
    return this.http.get(`${environment.grievanceApiUrl}v2/master/getStudentSubIssueCetrgoryList?id=${event}`);
  }

  proceedWithApplicationsId(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}v2/proceedWithApplicationsId`, { data: data });
  }

  getApplicantDetails(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}v2/getApplicantDetails`, { data: data });
  }
  
  getGrievanceDetailsAndStatus(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}v2/getGrievanceDetailsAndStatus`, { data: data });
  }

  studentLoginUsingOTP(data:any) :Observable<any>{
     return this.http.post(`${environment.grievanceApiUrl}auth/studentLoginUsingOTP`,data);

  }

 studentLoginUsingOTPVerify(data:any){
  return this.http.post(`${environment.grievanceApiUrl}auth/studentLoginUsingOTPVerify`,data);

 }



  // INO API's Start


  getInoMainIssueCetrgoryList()  {
    return this.http.get(`${environment.grievanceApiUrl}v2/master/getINOMainIssueCetrgoryList`);
  }


  inoLogin(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}auth/inoLogin`, data);
  }

  getInoDetails(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}v2/ino/getInoDetials`, { data: data })
  }

  saveInoGrievance(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}v2/ino/saveInoGrievance`, { data: data });
  }

  getAllInoGrievanceList(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}v2/ino/getAllInoGrievanceList`, { data: data });
  }

  viewStatusAndGrievanceDetails(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}v2/ino/getInoGrievanceDetailsAndStatus`, { data: data });
  }

  inoLoginUsingOTP(data:any) {
    return this.http.post(`${environment.grievanceApiUrl}auth/inoLoginUsingOTP`, data);

  }
  inoLoginUsingOTPVerify(data:any) {
    return this.http.post(`${environment.grievanceApiUrl}auth/inoLoginUsingOTPVerify`, data);

  }
  

// Ministry///////

 nodalOfficerLogin(data: any)  {
    return this.http.post(`${environment.grievanceApiUrl}auth/nodalOfficerLogin`, data);
  }
  

  getNodalOfficerDetails() {
    return this.http.post(`${environment.grievanceApiUrl}v2/nodalOfficer/getNodalOfficerDetails`,{ data:''});

  }

  getNodalOfficerMainIssueCetrgoryLis() {
    return this.http.get(`${environment.grievanceApiUrl}v2/master/getNodalOfficerMainIssueCetrgoryList`);
    
  }
   
  saveNodalOfficerGrievance(data:any) {
    return this.http.post(`${environment.grievanceApiUrl}v2/nodalOfficer/saveNodalOfficerGrievance`,{ data:data});

  }
   getNodalOfficerAllGrievanceList() {
     return this.http.post(`${environment.grievanceApiUrl}v2/nodalOfficer/getAllNodalOfficerGrievanceList`,{ data:''});

   }
  getNodalOfficerGrievanceDetailsAndStatus(data:any) {
     return this.http.post(`${environment.grievanceApiUrl}v2/nodalOfficer/getNodalOfficerGrievanceDetailsAndStatus`,{ data:data});

   }

  

}

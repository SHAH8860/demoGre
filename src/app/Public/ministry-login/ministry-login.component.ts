import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Common } from '../../Common/common';
import { EncDescServiceService } from '../../Common/enc-desc-service.service';
import { AlertService } from '../../Service/alert.service';
import { CommonService } from '../../Service/common.service';
import { LoaderService } from '../../Service/loader.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-ministry-login',
  standalone: true,
  imports: [
    RouterModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './ministry-login.component.html',
  styleUrl: './ministry-login.component.scss',
})
export class MinistryLoginComponent {
  captchaCode: string = '';
  show: boolean = true;
  academicYears: any = [];
  selectedYear: string | null = null;
  form: FormGroup;
  unSubscribeSubject: Subject<any> = new Subject();
  imageSource: any;
  captchaID: any;
  saltForOTR: any;
  saltTxtForOTR: any;
  saltForApplicationID: any;
  saltTextForApplicationID: any;

  constructor(
    private _fb: FormBuilder,
    private _common: CommonService,
    private sanitizer: DomSanitizer,
    private loader: LoaderService,
    private router: Router,
    private _alert: AlertService,
    private encryptionService: EncDescServiceService
  ) {
    this.form = this.formControl();
    this.form.get('loginType')?.setValue('P');
     localStorage.clear();
    sessionStorage.clear();
    this._common.removeToken();
  }

  ngOnInit(): void {
    this.getImageCaptcha();
    this.getSaltForApplicationId();
  }

  formControl() {
    return this._fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      loginType: [''],
      captcha: ['', Validators.required],
    });
  }
  toogle() {
    this.show = !this.show;
  }

  getImageCaptcha() {
    this.loader.showLoader();
    this._common
      .getImageCaptcha()
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.loader.hideLoader();
          if (res.status == 'SUCCESS') {
            this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(
              `data:image/png;base64, ${res.data[0].captchaBytFile}`
            );
            this.captchaID = res.data[0].captchaId;
          }
        },
        error: (error: any) => {
           if(error){
            this._common.errorLogging()
          }
        },
      });
  }

  getSaltForApplicationId() {
    this.loader.showLoader();
    this._common
      .getSaltForApplicationId()
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.loader.hideLoader();
          if (res.status == 'SUCCESS') {
            this.saltForApplicationID = res.data[0].saltId;
            this.saltTextForApplicationID = res.data[0].saltText;
          }
        },
        error: (error: any) => {
           if(error){
            this._common.errorLogging()
          }
        },
      });
  }

  refreshCaptcha(): void {
    this.form?.get('captcha')?.reset();
    this.getImageCaptcha();
  }

  loginMinistry() {
    if (this.form.valid) {
       this.loader.showLoader();
      const firstplaintext =
        Common.encWithSHAH(this.form?.get('password')?.value.trim()) +
        this.saltTextForApplicationID;
      const password = Common.encWithSHAH(firstplaintext);

      let payload = {
        username: this.form.get('userName')?.value.trim(),
        password: password,
        saltTxnId: this.saltForApplicationID,
        captchaText: this.form?.get('captcha')?.value,
        captchaId: this.captchaID,
      };
      this._common
        .nodalOfficerLogin(payload)
        .pipe(takeUntil(this.unSubscribeSubject))
        .subscribe({
          next: (res: any) => {
            this.loader.hideLoader()
            if (res.error) {
              this._alert.swalPopError(res.error.fieldError.error);
              this.refreshCaptcha()
            }else{
            if (res.token) {
              sessionStorage.setItem('token', res.token);
               this._common.setToken(res.token);
              sessionStorage.setItem('applicantName',this.encryptionService.encrypt(res.applicantName));
              sessionStorage.setItem('userType',this.encryptionService.encrypt(res.userType));
              sessionStorage.setItem('userModule', 'ministry');
              this._alert.swalPopSuccess('Logged in successfully');
              this.router.navigate(['/ministry-dashBoard/ministry-grivance-registration']);
            }
          }
            
          },
          error: (error: any) => {
             if(error){
            this._common.errorLogging()
          }
          },
        });
    } else {
      this.form.markAllAsTouched();
      this._alert.swalPopError('Please fill required field');
    }
  }
   disableCopyPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }
}

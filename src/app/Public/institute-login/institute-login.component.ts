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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OtpPopUpComponent } from '../../Common/POPUP/otp-pop-up/otp-pop-up.component';

@Component({
  selector: 'app-institute-login',
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
    MatDialogModule,
  ],
  templateUrl: './institute-login.component.html',
  styleUrl: './institute-login.component.scss',
})
export class InstituteLoginComponent implements OnInit {
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
  showmobilenumber: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _common: CommonService,
    private sanitizer: DomSanitizer,
    private loader: LoaderService,
    private router: Router,
    private _alert: AlertService,
    private encryptionService: EncDescServiceService,
    private _dialog: MatDialog
  ) {
    this.form = this.formControl();
    this.form.get('loginType')?.setValue('P');
    sessionStorage.clear();
    localStorage.clear();
    this._common.removeToken();
  }

  ngOnInit(): void {
    this.getImageCaptcha();
    this.getSaltForApplicationId();
    this.form.get('loginType')?.valueChanges.subscribe((value) => {
      this.showmobilenumber = value === 'M';

      if (this.showmobilenumber) {
        this.form
          .get('mobileno')
          ?.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.minLength(10),
            Validators.maxLength(10),
          ]);
        this.form.get('password')?.clearValidators();
        this.form.get('userName')?.clearValidators();

      } else {
        this.form.get('mobileno')?.clearValidators();
        this.form.get('password')?.setValidators([Validators.required]);
        this.form.get('userName')?.setValidators([Validators.required]);
      }

      this.form.get('mobileno')?.updateValueAndValidity();
      this.form.get('password')?.updateValueAndValidity();
      this.form.get('userName')?.updateValueAndValidity();
    });
  }
  formControl() {
    return this._fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      loginType: [''],
      captcha: ['', Validators.required],
      mobileno: [''],
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
          if (error) {
            this._common.errorLogging();
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
          if (error) {
            this._common.errorLogging();
          }
        },
      });
  }

  refreshCaptcha(): void {
    this.form?.get('captcha')?.reset();
    this.getImageCaptcha();
  }

  inoLoginUsingOTP(event: MouseEvent) {
    (event.target as HTMLElement).blur();
    if (this.form.valid) {
      this.loader.showLoader();
      let payload = {
        username: this.form.get('mobileno')?.value?.trim(),
        captchaText: this.form?.get('captcha')?.value,
        captchaId: this.captchaID,
      };
      this._common
        .inoLoginUsingOTP(payload)
        .pipe(takeUntil(this.unSubscribeSubject))
        .subscribe({
          next: (res: any) => {
            console.log("getotp",res)
            this.loader.hideLoader();
            if (res.status === 'FAIL') {
              if (res.error) {
                this._alert.swalPopError(res.error.fieldError.error);
                this.refreshCaptcha();
              }
            } else {
              if (res.status === 'SUCCESS') {
                const dialogRef = this._dialog.open(OtpPopUpComponent, {
                  width: '1300px',
                  height: '700px',
                  autoFocus: true,
                  restoreFocus: true,
                });
                sessionStorage.setItem('inousermobileno',this.encryptionService.encrypt(this.form.get('mobileno')?.value?.trim()))
              }
            }
          },
          error: (error: any) => {
            if(error){
            this._common.errorLogging();
            }
          },
        });
    } else {
      this.form.markAllAsTouched();
      this._alert.swalPopError('Please fill required field');
    }
  }

  loginIno() {
    if (this.form.valid) {
      this.loader.showLoader();
      const firstplaintext =
        Common.encWithSHAH(this.form?.get('password')?.value) +
        this.saltTextForApplicationID;
      const password = Common.encWithSHAH(firstplaintext);
      let payload = {
        username: this.form.get('userName')?.value?.trim(),
        password: password,
        saltTxnId: this.saltForApplicationID,
        captchaText: this.form?.get('captcha')?.value,
        captchaId: this.captchaID,
      };
      this._common
        .inoLogin(payload)
        .pipe(takeUntil(this.unSubscribeSubject))
        .subscribe({
          next: (res: any) => {
            this.loader.hideLoader();
            if (res.error) {
              this._alert.swalPopError(res.error.fieldError.error);
              this.refreshCaptcha();
            } else {
              if (res.token) {
                sessionStorage.setItem('token', res.token);
                this._common.setToken(res.token);
                sessionStorage.setItem(
                  'InstituteId',
                  this.encryptionService.encrypt(
                    this.form?.get('userName')?.value
                  )
                );
                sessionStorage.setItem(
                  'InstituteName',
                  this.encryptionService.encrypt(res?.applicantName)
                );
                sessionStorage.setItem(
                  'userType',
                  this.encryptionService.encrypt(res?.userType)
                );
                sessionStorage.setItem('userModule', 'institute');
                this._alert.swalPopSuccess('Logged in successfully');
                this.router.navigate([
                  'institute-dashBoard/institute-grivance-registration',
                ]);
              }
            }
          },
          error: (error: any) => {
            if (error) {
              this._common.errorLogging();
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

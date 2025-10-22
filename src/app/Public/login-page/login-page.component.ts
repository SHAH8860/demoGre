import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Common } from '../../Common/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonService } from '../../Service/common.service';
import { Subject, takeUntil } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from '../../Service/loader.service';
import { AlertService } from '../../Service/alert.service';
import { EncDescServiceService } from '../../Common/enc-desc-service.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginotppopupComponent } from '../../Common/POPUP/loginotppopup/loginotppopup.component';
@Component({
  selector: 'app-login-page',
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
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
  captchaCode: string = '';
  show: boolean = true;
  academicYears: any = [];
  selectedYear: string | null = null;
  form: FormGroup | any;
  unSubscribeSubject: Subject<any> = new Subject();
  imageSource: any;
  captchaID: any;
  saltForOTR: any;
  saltTxtForOTR: any;
  saltForApplicationID: any;
  saltTextForApplicationID: any;
  showmobilenumber: any;

  constructor(
    private _fb: FormBuilder,
    private _common: CommonService,
    private sanitizer: DomSanitizer,
    private loader: LoaderService,
    private router: Router,
    private _alert: AlertService,
    private encryptionService: EncDescServiceService,
    private _dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.formControl();
    localStorage.clear();
    sessionStorage.clear();
    this._common.removeToken();
  }
  ngOnInit(): void {
    this.generateAcademicYears();
    this.getSaltForOtr();
    this.getSaltForApplicationId();
    this.getImageCaptcha();
    this.form.get('loginType')?.valueChanges.subscribe((value: any) => {
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
        this.form.get('applicationID')?.clearValidators();
        this.form.get('otr')?.clearValidators();
      } else {
        this.form.get('mobileno')?.clearValidators();
        this.form.get('password')?.setValidators([Validators.required]);
        this.form.get('applicationID')?.setValidators([Validators.required]);
      }

      this.form.get('mobileno')?.updateValueAndValidity();
      this.form.get('password')?.updateValueAndValidity();
      this.form.get('applicationID')?.updateValueAndValidity();
      this.form.get('otr')?.updateValueAndValidity();
    });
  }

  formControl() {
    return this._fb.group({
      academicYear: ['', Validators.required],
      applicationType: [],
      applicationID: [''],
      otr: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(14),
        ],
      ],
      password: ['', Validators.required],
      captcha: ['', Validators.required],
      loginType: ['P', Validators.required],
      mobileno: [],
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

  getSaltForOtr() {
    this.loader.showLoader();
    this._common
      .getSaltForOtr()
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.loader.hideLoader();
          if (res) {
            this.saltForOTR = res.saltTxnId;
            this.saltTxtForOTR = res.salt;
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

  generateAcademicYears() {
    const currentYear = new Date().getFullYear();
    this.academicYears = [];
    let currentAcademicYear = '';
    for (let i = 0; i < 3; i++) {
      const startYear = currentYear - i;
      const endYear = (currentYear - i + 1).toString().slice(-2);
      const academicYear = `Academic Year ${startYear}-${endYear}`;

      this.academicYears.push(academicYear);

      if (i === 0) {
        currentAcademicYear = academicYear;
      }
    }
    this.form.get('academicYear').patchValue(currentAcademicYear);

    return currentAcademicYear;
  }

  shouldShowRadioGroup(): boolean {
    if (!this.selectedYear) return false;
    const match = this.selectedYear.match(/(\d{4})-\d{2}/);
    if (!match) return false;

    const year = parseInt(match[1], 10);
    return year <= 2023;
  }

  updateValidators() {
    const shouldValidate = this.shouldShowRadioGroup();
    const applicationTypeControl = this.form.get('applicationType');
    const applicationIDControl = this.form.get('applicationID');

    if (shouldValidate) {
      applicationTypeControl?.setValidators(Validators.required);
      applicationIDControl?.setValidators(Validators.required);
      this.form.get('otr')?.clearValidators();
      this.form.get('otr')?.updateValueAndValidity();
      this.form?.get('loginType')?.setValue('P');
      this.form?.get('applicationType')?.setValue('F');
    } else {
      applicationTypeControl?.clearValidators();
      applicationIDControl?.clearValidators();
      this.form.get('mobileno')?.clearValidators();
      this.form.get('password')?.setValidators([Validators.required]);
      this.form
        .get('otr')
        ?.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(14),
        ]);

      this.showmobilenumber = false;
    }
    applicationTypeControl?.updateValueAndValidity();
    applicationIDControl?.updateValueAndValidity();
    this.form.get('mobileno')?.updateValueAndValidity();
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('otr')?.updateValueAndValidity();
  }

  onYearChange() {
    this.selectedYear = this.form.get('academicYear')?.value;
    this.form?.get('password').reset();
    this.form?.get('otr').reset();
    this.form?.get('applicationType').reset();
    this.form?.get('applicationID').reset();
    this.form?.get('captcha').reset();
    this.updateValidators();
  }

  studentLoginUsingOTP() {
    (document.activeElement as HTMLElement)?.blur();
    if (this.form.valid) {
      this.loader.showLoader()
      let payload = {
        username: this.form?.get('mobileno')?.value,
        captchaText: this.form?.get('captcha')?.value,
        captchaId: this.captchaID,
      };
      this._common
        .studentLoginUsingOTP(payload)
        .pipe(takeUntil(this.unSubscribeSubject))
        .subscribe({
          next: (res: any) => {
            this.loader.hideLoader()
            console.log("otp",res)
            if (res.status === 'FAIL') {
              if (res.error) {
                this._alert.swalPopError(res.error.fieldError.error);
                this.refreshCaptcha();
              }
            } else {
              if (res.status === 'SUCCESS') {
                const dialogRef = this._dialog.open(LoginotppopupComponent, {
                  width: '1300px',
                  height: '700px',
                  autoFocus: false,
                  restoreFocus: false,
                });
                 sessionStorage.setItem('inousermobileno',this.encryptionService.encrypt(this.form.get('mobileno')?.value?.trim()))
                 this.cdr.detectChanges();
              }
            }
          },

          error: (error: any) => {},
        });
    } else {
      this.form.markAllAsTouched();
      this._alert.swalPopError('Please fill required field');
    }
  }

  loginUser() {
    let payload = {};
    if (this.form.valid) {
      this.loader.showLoader();
      const yearLabel1 = this.form?.get('academicYear')?.value;
      const numericYear1 = yearLabel1
        ?.match(/\d{4}-\d{2}/)?.[0]
        .replace('-', '');
      sessionStorage.setItem(
        'ay',
        this.encryptionService.encrypt(numericYear1)
      );

      if (!this.shouldShowRadioGroup()) {
        const pass =
          Common.SHA512_MD5(this.form?.get('password')?.value) +
          this.saltTxtForOTR;
        const password = Common.SHA512_MD5(pass);
        payload = {
          username: this.form?.get('otr')?.value,
          password: password,
          saltTxnId: this.saltForOTR,
          ay: numericYear1,
          captchaText: this.form?.get('captcha')?.value,
          captchaId: this.captchaID,
        };
        this._common
          .loginUser(payload)
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
                    'otr',
                    this.encryptionService.encrypt(this.form?.get('otr')?.value)
                  );
                  sessionStorage.setItem('userModule', 'applicant');
                  this._alert.swalPopSuccess('Logged in successfully');
                  this.router.navigate(['/grivance']);
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
        const firstplaintext =
          Common.encWithSHAH(this.form?.get('password')?.value) +
          this.saltTextForApplicationID;
        const password = Common.encWithSHAH(firstplaintext);
        payload = {
          username: this.form?.get('applicationID')?.value,
          password: password,
          saltTxnId: this.saltForApplicationID,
          ay: numericYear1,
          fresh_renewal: this.form?.get('applicationType')?.value,
          captchaText: this.form?.get('captcha')?.value,
          captchaId: this.captchaID,
        };
        this._common
          .loginUser(payload)
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
                    'applicationId',
                    this.encryptionService.encrypt(
                      this.form?.get('applicationID')?.value
                    )
                  );
                  sessionStorage.setItem(
                    'applicantName',
                    this.encryptionService.encrypt(res?.applicantName)
                  );
                  sessionStorage.setItem('userModule', 'applicant');
                  this._alert.swalPopSuccess('Logged in successfully');
                  this.router.navigate(['dashBoard/grivanceRegistration']);
                }
              }
            },
            error: (error: any) => {
              if (error) {
                this.loader.hideLoader();
                this._common.errorLogging();
              }
            },
          });
      }
    } else {
      this.form.markAllAsTouched();
      this._alert.swalPopError('Please fill required field');
    }
  }

  disableCopyPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }
}

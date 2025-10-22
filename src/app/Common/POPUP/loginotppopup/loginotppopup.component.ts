import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AlertService } from '../../../Service/alert.service';
import { CommonService } from '../../../Service/common.service';
import { LoaderService } from '../../../Service/loader.service';
import { EncDescServiceService } from '../../enc-desc-service.service';
import { OtpPopUpComponent } from '../otp-pop-up/otp-pop-up.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-loginotppopup',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
  ],
  templateUrl: './loginotppopup.component.html',
  styleUrl: './loginotppopup.component.scss',
})
export class LoginotppopupComponent {
  form!: FormGroup;
  unSubscribeSubject: Subject<any> = new Subject();
  imageSource: any;
  captchaID: any;
  inousermobileno: any;

  constructor(
    private _fb: FormBuilder,
    private _alertService: AlertService,
    private router: Router,
    private _common: CommonService,
    public dialogRef: MatDialogRef<OtpPopUpComponent>,
    private loader: LoaderService,
    private sanitizer: DomSanitizer,
    private encryptionService: EncDescServiceService
  ) {
    this.form = this._fb.group({
      otp1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp4: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp5: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      captcha: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.getImageCaptcha();
  }
  moveFocus(
    currentInput: HTMLInputElement,
    nextInput: HTMLInputElement | null
  ): void {
    if (currentInput.value.length === currentInput.maxLength) {
      nextInput?.focus();
    }
  }

  handleBackspace(
    event: KeyboardEvent,
    currentInput: HTMLInputElement,
    prevInput: HTMLInputElement | null
  ): void {
    if (event.key === 'Backspace' && currentInput.value === '') {
      prevInput?.focus();
    }
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

  refreshCaptcha(): void {
    this.form?.get('captcha')?.reset();
    this.getImageCaptcha();
  }

  studentLoginUsingOTPVerify() {
    if (this.form.valid) {
      this.loader.showLoader();
      this.inousermobileno = JSON.parse(
        this.encryptionService.decrypt(
          sessionStorage.getItem('inousermobileno')
        )
      );
      let otp =
        this.form.get('otp1')?.value +
        this.form.get('otp2')?.value +
        this.form.get('otp3')?.value +
        this.form.get('otp4')?.value +
        this.form.get('otp5')?.value;
      let payload = {
        username: this.inousermobileno,
        captchaText: this.form?.get('captcha')?.value,
        captchaId: this.captchaID,
        otp: otp,
      };
      this._common
        .studentLoginUsingOTPVerify(payload)
        .pipe(takeUntil(this.unSubscribeSubject))
        .subscribe({
          next: (res: any) => {
            this.loader.hideLoader();
            if (res.error) {
              this._alertService.swalPopError(res.error.fieldError.error);
              this.refreshCaptcha();
            } else {
              if (res.token) {
                this.dialogRef.close();
                sessionStorage.setItem('token', res.token);
                sessionStorage.setItem(
                  'registeredOrNot',
                  this.encryptionService.encrypt('No')
                );
                this._common.setToken(res.token);
                sessionStorage.setItem(
                  'applicationId',
                  this.encryptionService.encrypt(res?.applicantName)
                );
                sessionStorage.setItem(
                  'applicantName',
                  this.encryptionService.encrypt(res?.applicantName)
                );
                sessionStorage.setItem(
                  'mobileNo',
                  this.encryptionService.encrypt(res?.applicantName)
                );
                sessionStorage.setItem('userModule', 'applicant');
                this._alertService.swalPopSuccess('Logged in successfully');
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
    } else {
      this.form.markAllAsTouched();
      this._alertService.swalPopError('Please fill required field');
    }
  }
}

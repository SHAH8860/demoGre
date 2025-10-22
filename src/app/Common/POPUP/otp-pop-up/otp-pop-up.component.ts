import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertService } from '../../../Service/alert.service';
import { CommonService } from '../../../Service/common.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoaderService } from '../../../Service/loader.service';
import { Subject, takeUntil } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { EncDescServiceService } from '../../enc-desc-service.service';

@Component({
  selector: 'app-otp-pop-up',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
  ],
  templateUrl: './otp-pop-up.component.html',
  styleUrl: './otp-pop-up.component.scss',
})
export class OtpPopUpComponent implements OnInit {
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

  inoLoginUsingOTPVerify() {
    if (this.form.valid) {
      this.loader.showLoader()
      this.inousermobileno = JSON.parse(
        this.encryptionService.decrypt(sessionStorage.getItem('inousermobileno'))
      );
      let otp =
        this.form.get('otp1')?.value +
        this.form.get('otp2')?.value +
        this.form.get('otp3')?.value +
        this.form.get('otp4')?.value +
        this.form.get('otp5')?.value 
      let payload = {
        username: this.inousermobileno,
        captchaText: this.form?.get('captcha')?.value,
        captchaId: this.captchaID,
        otp: otp,
      };
      this._common.inoLoginUsingOTPVerify(payload).pipe(takeUntil(this.unSubscribeSubject)).subscribe({
        next:(res:any)=>{
          this.loader.hideLoader()
           if (res.error) {
              this._alertService.swalPopError(res.error.fieldError.error);
              this.refreshCaptcha();
            } else {
              if (res.token) {
                this.dialogRef.close()
                sessionStorage.setItem('token', res.token);
                sessionStorage.setItem('registeredOrNot', this.encryptionService.encrypt('No'));
                this._common.setToken(res.token);
                sessionStorage.setItem(
                  'InstituteId',
                  this.encryptionService.encrypt(
                    this.inousermobileno
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
                this._alertService.swalPopSuccess('Logged in successfully');
                this.router.navigate([
                  'institute-dashBoard/institute-grivance-registration',
                ]);
              }
            }

        },
        error:(error:any)=>{
           this.loader.hideLoader()
        }
      })
    }
    else{
       this.form.markAllAsTouched();
      this._alertService.swalPopError('Please fill required field');
    }
  }
}

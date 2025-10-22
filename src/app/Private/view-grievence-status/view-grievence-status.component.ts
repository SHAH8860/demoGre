import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EncDescServiceService } from '../../Common/enc-desc-service.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonService } from '../../Service/common.service';
import { Subject, takeUntil } from 'rxjs';
import { AlertService } from '../../Service/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-grievence-status',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    
  ],
  templateUrl: './view-grievence-status.component.html',
  styleUrl: './view-grievence-status.component.scss',
})
export class ViewGrievenceStatusComponent implements OnInit {
  applicationId: any;
  form: FormGroup | any;
  unSubscribeSubject: Subject<any> = new Subject();
  constructor(
    private encryptionService: EncDescServiceService,
    private _fb: FormBuilder,
    private _common: CommonService,
    private _alert: AlertService,
    private router: Router
  ) {
    this.form = this._fb.group({
      registrationNo: ['', Validators.required],
      mobileNo: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    let mobileNumber = JSON.parse(
      this.encryptionService.decrypt(sessionStorage.getItem('mobileNo'))
    );
    mobileNumber ? this.form?.get('mobileNo')?.patchValue(mobileNumber) : '';
  }

  getGrievanceDetailsAndStatus() {
    if (this.form.valid) {
      let payload = {
        applicationId: JSON.parse(
          this.encryptionService.decrypt(
            sessionStorage.getItem('applicationId')
          )
        ),
        registrationNo: this.form?.get('registrationNo')?.value?.trim(),
      };
      payload = this.encryptionService.encrypt(payload);
      this._common
        .getGrievanceDetailsAndStatus(payload)
        .pipe(takeUntil(this.unSubscribeSubject))
        .subscribe({
          next: (res: any) => {
            if (res.status == 'FAIL') {
              this._alert.swalPopError(res.error.fieldError.error);
            } else {
              if (res.status == 'SUCCESS') {
                const payload2={
                  registrationNo: this.form?.get('registrationNo')?.value?.trim(),
                  data:res.data[0]

                }
                const encpayload=this.encryptionService.encrypt(payload2);
                sessionStorage.setItem('viewMode',encpayload)
                this.router.navigate(['/dashBoard/grivanceRegistration'])
              
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
}

import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { EncDescServiceService } from '../../../Common/enc-desc-service.service';
import { CommonService } from '../../../Service/common.service';
import { AlertService } from '../../../Service/alert.service';
import { LoaderService } from '../../../Service/loader.service';

@Component({
  selector: 'app-view-grievance-status',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './view-grievance-status.component.html',
  styleUrl: './view-grievance-status.component.scss'
})
export class ViewGrievanceStatusComponent {

  applicationId: any;
  form: FormGroup | any;
  unSubscribeSubject: Subject<any> = new Subject();
  constructor(
    private encryptionService: EncDescServiceService,
    private _router: ActivatedRoute,
    private _fb: FormBuilder,
    private _common: CommonService,
    private _alert: AlertService,
    private router: Router,
    private _loader: LoaderService
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

  viewGrievanceDetailsAndStatus() {
    if (this.form.valid) {
       this._loader.showLoader();
      let payload = {
        userName: JSON.parse(
          this.encryptionService.decrypt(sessionStorage.getItem('InstituteName'))
        ),
        registrationNo: this.form?.get('registrationNo')?.value?.trim(),
      };
      payload = this.encryptionService.encrypt(payload);
      this._common
        .viewStatusAndGrievanceDetails(payload)
        .pipe(takeUntil(this.unSubscribeSubject))
        .subscribe({
          next: (res: any) => {
            this._loader.hideLoader();
            if (res.status == 'SUCCESS') {

              const payload2={
                  registrationNo: this.form?.get('registrationNo')?.value?.trim(),
                  data:res.data[0]

                }
                const encpayload=this.encryptionService.encrypt(payload2);
                sessionStorage.setItem('viewMode',encpayload)
              this.router.navigate(['/institute-dashBoard/institute-grivance-registration']);
            }
            if (res.status == 'FAIL') {
               this._loader.hideLoader();
              this._alert.swalPopError(res.error.fieldError.error);
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
      this._alert.swalPopError('Please fill required field')
    }
  }

}

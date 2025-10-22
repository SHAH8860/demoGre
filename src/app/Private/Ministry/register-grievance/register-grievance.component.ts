import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { pipe, Subject, take, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '../../../Service/common.service';
import { EncDescServiceService } from '../../../Common/enc-desc-service.service';
import { LoaderService } from '../../../Service/loader.service';
import { AlertService } from '../../../Service/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-grievance',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatTooltipModule,
  ],
  templateUrl: './register-grievance.component.html',
  styleUrl: './register-grievance.component.scss',
})
export class RegisterGrievanceComponent implements OnInit {
  unSubscribeSubject: Subject<any> = new Subject();
  schemeData: any;
  base64: any;
  ministryNameToggle: boolean = false;
  fileUploadShow: boolean = false;
  showFileError: boolean = true;
  formSubmit!: FormGroup;
  instituteID: any;
  mainIssueData: any;
  applicationId: any;
  emailID: any;
  userType: any;
  registrationNo: any;
  constructor(
    private _fb: FormBuilder,
    private _common: CommonService,
    private encryptionService: EncDescServiceService,
    private LoaderService: LoaderService,
    private AlertService: AlertService,
    private route: ActivatedRoute,
    private __router: Router
  ) {
    this.formSubmit = this.getAllformControlls();
    this.route.queryParams.subscribe((params: any) => {
      if (params['id']) {
        const decryptData = this.encryptionService.decrypt(params['id']);
        const parseData = JSON.parse(decryptData);
        this.registrationNo = parseData.registrationNo;
        const data = this.encryptionService.decrypt(parseData.data);
        this.applicationId = JSON.parse(data);
      }
    });
    this.userType = JSON.parse(
      this.encryptionService.decrypt(sessionStorage.getItem('userType'))
    );
  }

  ngOnInit(): void {
    if (this.applicationId) {
      this.proceedWithApplicationsId();
    } else {
      this.getNodalOfficerDetails();
      this.getNodalOfficerMainIssueCetrgoryLis();
    }
  }

  getAllformControlls() {
    return this._fb.group({
      name: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required]],
      district: [''],
      state: [''],
      mainIssueCategory: ['', [Validators.required]],
      ministryId: ['', [Validators.required]],
      address1: [
        '',
        [
          Validators.required,
          this.noOnlyWhitespaceValidator(),
          this.onlyAllowedCharactersValidator(),
          Validators.pattern(/^(?!.*000).+$/),
        ],
      ],
      address2: [
        '',
        [
          this.noOnlyWhitespaceValidator(),
          this.onlyAllowedCharactersValidator(),
          Validators.pattern(/^(?!.*000).+$/),
        ],
      ],
      file: [''],
      query: [
        '',
        [
          Validators.required,
          this.noOnlyWhitespaceValidator(),
          this.onlyAllowedCharactersValidator(),
          Validators.pattern(/^(?:\s*\S+\s+){2,}\S+\s*$/)

        ],
      ],
      grievanceStatus: [],
    });
  }
  getNodalOfficerDetails() {
    this.LoaderService.showLoader();
    this._common
      .getNodalOfficerDetails()
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.LoaderService.hideLoader();
          if (res.status == 'FAIL') {
            if (res.error) {
              this.AlertService.swalPopError(res.error.fieldError.error);
            }
          } else {
            if (res.status === 'SUCCESS') {
              const encdata = JSON.parse(
                this.encryptionService.decrypt(res.data[0])
              );
              sessionStorage.setItem(
                'mobileNo',
                this.encryptionService.encrypt(encdata[0]?.mobileNo)
              );
              this.formSubmit.get('name')?.patchValue(encdata[0]?.name);
              this.formSubmit
                .get('mobileNumber')
                ?.patchValue(encdata[0]?.mobileNo);
              this.formSubmit
                .get('district')
                ?.patchValue(encdata[0]?.districtName);
              this.formSubmit.get('state')?.patchValue(encdata[0]?.stateName);
              this.formSubmit
                .get('ministryId')
                ?.patchValue(encdata[0]?.ministryName);
              this.emailID = encdata[0]?.emailId;
            }
          }
        },
        error: (error: any) => {
          if (error) {
            this._common.errorLogging();
          }
        },
      });
  }
  getNodalOfficerMainIssueCetrgoryLis() {
    this.LoaderService.showLoader();
    this._common
      .getNodalOfficerMainIssueCetrgoryLis()
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.LoaderService.hideLoader();

          if (Array.isArray(res.data) && res.data.length > 0) {
            this.mainIssueData = res.data;
          }
        },
        error: (error) => {
          if (error) {
            this._common.errorLogging();
          }
        },
      });
  }

  proceedWithApplicationsId() {
    if (
      this.applicationId[0].ministryName ||
      this.applicationId[0].schemeName
    ) {
      this.ministryNameToggle = true;
      this.formSubmit
        .get('ministryId')
        ?.patchValue(this.applicationId[0].ministryName);
      this.formSubmit.get('file')?.disable();
    }
    if (this.applicationId[0]?.file) {
      this.fileUploadShow = true;
      this.showFileError = false;
    }
    this.formSubmit.get('name')?.patchValue(this.applicationId[0].name);
    this.formSubmit
      .get('mobileNumber')
      ?.patchValue(this.applicationId[0].mobileNo);
    this.formSubmit
      .get('district')
      ?.patchValue(this.applicationId[0].districtName);
    this.formSubmit.get('state')?.patchValue(this.applicationId[0].stateName);
    this.formSubmit.get('address1')?.patchValue(this.applicationId[0].address1);

    if (this.applicationId[0].address2) {
      this.formSubmit
        .get('address2')
        ?.patchValue(this.applicationId[0].address2);
    } else {
      this.formSubmit.get('address2')?.patchValue('NA');
    }
    this.formSubmit.get('query')?.patchValue(this.applicationId[0].query);
    if (this.applicationId[0]?.grievanceStatus !== null) {
      this.formSubmit
        .get('grievanceStatus')
        ?.patchValue(this.applicationId[0]?.grievanceStatus);
    } else {
      this.formSubmit.get('grievanceStatus')?.patchValue('Pending');
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!this.isSafePdfFileName(file.name)) {
        this.AlertService.swalPopErrorTimer('Invalid Format.');
        event.target.value = '';
        return;
      }
      if (fileExtension === 'pdf') {
        const maxSizeInBytes = 200 * 1024;
        if (file.size > maxSizeInBytes) {
          this.AlertService.swalPopErrorTimer(
            'File size must be less than or equal to 200 KB.'
          );
          event.target.value = '';
          return;
        }
        this.AlertService.swalPopSuccess('File uploaded successfully.');
        this.convertToBase64(file);
      } else {
        this.AlertService.swalPopErrorTimer('Only PDF files are allowed.');
        event.target.value = '';
      }
    }
  }

  isSafePdfFileName(fileName: string): boolean {
    if (fileName.includes('..')) return false;
    const regex = /^[a-zA-Z0-9_\- ]+\.pdf$/i;
    return regex.test(fileName);
  }

  convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      this.base64 = base64String;
    };
  }

  downloadPDFFile() {
    this.downloadPdfFromBase64(this.applicationId[0]?.file);
  }

  downloadPdfFromBase64(base64Data: string, fileName: string = 'document.pdf') {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    const url = window.URL.createObjectURL(blob);
  }
  submitFormData() {
    if (this.formSubmit.valid) {
      this.LoaderService.showLoader();
      let payload = {
        mainIssueCategory: this.formSubmit.get('mainIssueCategory')?.value,
        address1: this.formSubmit.get('address1')?.value.trim(),
        address2: this.formSubmit.get('address2')?.value.trim(),
        query: this.formSubmit.get('query')?.value.trim(),
        emailId: this.emailID,
        file: this.base64,
      };
      payload = this.encryptionService.encrypt(payload);
      this._common
        .saveNodalOfficerGrievance(payload)
        .pipe(takeUntil(this.unSubscribeSubject))
        .subscribe({
          next: (res: any) => {
            if (res.status == 'FAIL') {
              if (res.error) {
                this.LoaderService.hideLoader();
                this.AlertService.swalPopError(res.error.fieldError.error);
              }
            } else {
              if (res.status == 'SUCCESS') {
                this.LoaderService.hideLoader();
                const encdata = JSON.parse(
                  this.encryptionService.decrypt(res.data[0])
                );
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  html: `Grievance registration successfully. Your registration number is <b>${encdata[0]?.grievanceRegistrationNumber}</b>.`,
                  didOpen: () => {
                    const titleEl = document.querySelector(
                      '.swal2-title'
                    ) as HTMLElement;
                    if (titleEl) {
                      titleEl.style.fontSize = '1.2rem';
                    }
                  },
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.__router.navigate([
                      '/ministry-dashBoard/ministry-all-grivenceList',
                    ]);
                  }
                });
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
      this.formSubmit.markAllAsTouched();
      this.AlertService.swalPopError('Please fill required field');
    }
  }

  onlyAllowedCharactersValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const pattern = /^[a-zA-Z0-9\s,\/\\\-]+$/;
      const isValid = pattern.test(value);
      return isValid ? null : { invalidCharacters: true };
    };
  }

  noOnlyWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const isWhitespaceOnly =
        typeof value === 'string' && value.trim().length === 0;
      return isWhitespaceOnly ? { whitespace: true } : null;
    };
  }

  
}

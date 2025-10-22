import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class RegisterGrievanceComponent implements OnInit, OnDestroy {
  unSubscribeSubject: Subject<any> = new Subject();
  ministriesData: any;
  mainIssueData: any;
  aisheCode: any;
  schemeData: any;
  base64: any;
  ministryNameToggle: boolean = false;
  fileUploadShow: boolean = false;
  showFileError: boolean = true;
  inoDetails: any;
  formSubmit!: FormGroup;
  numberformSubmit!: FormGroup;
  instituteID: any;
  registeredOrNot: boolean = false;
  stateList: any;
  districtList: any;
  registeredOrNotValue: any;
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
    this.aisheCode = JSON.parse(
      this.encryptionService.decrypt(sessionStorage.getItem('InstituteName'))
    );

    let decryptedData: string | null =
      sessionStorage.getItem('registeredOrNot');

    let register = '';
    try {
      if (decryptedData) {
        register = JSON.parse(this.encryptionService.decrypt(decryptedData));
        this.registeredOrNotValue = register;
      }
    } catch (error) {
      console.error('Failed to parse decrypted data:', error);
      register = '';
    }

    this.registeredOrNot = register === 'No';

    const view = sessionStorage.getItem('viewMode');
    if (view) {
      const decryptData = this.encryptionService.decrypt(view);
      const parseData = JSON.parse(decryptData);
      this.registrationNo = parseData.registrationNo;
      const data = this.encryptionService.decrypt(parseData.data);
      this.instituteID = JSON.parse(data);
    }
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

  getAllformControlls() {
    return this._fb.group({
      aisheCode: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required]],
      emailId: ['', [Validators.required, Validators.email]],
      district: ['', [Validators.required]],
      state: ['', [Validators.required]],
      mainIssueCategory: ['', [Validators.required]],
      ministryId: ['', [Validators.required]],
      ministryId1: [''],
      schemeId: ['', Validators.required],
      schemeId1: [''],
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
      fullname: ['', Validators.required],
      gender: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.registeredOrNot) {
      this.getState();
      this.formSubmit.get('aisheCode')?.patchValue(this.aisheCode);
      this.formSubmit.get('mobileNumber')?.patchValue(this.aisheCode);
      this.formSubmit
        .get('registeredOrNot')
        ?.patchValue(this.registeredOrNotValue);

      sessionStorage.setItem(
        'mobileNo',
        this.encryptionService.encrypt(this.aisheCode)
      );
    }
    this.getInoMainIssueCetrgoryList();
    this.getMinistriesList();

    if (this.instituteID) {
      this.proceedWithApplicationsId();
    } else {
      if (!this.registeredOrNot) {
        this.getInoDetails();
      }
    }
  }

  proceedWithApplicationsId() {
    if (this.instituteID[0].ministryName || this.instituteID[0].schemeName) {
      this.ministryNameToggle = true;
      this.formSubmit
        .get('ministryId1')
        ?.patchValue(this.instituteID[0].ministryName);
      this.formSubmit
        .get('schemeId1')
        ?.patchValue(this.instituteID[0].schemeName);
      this.formSubmit.get('file')?.disable();
    }
    if (this.instituteID[0]?.file) {
      this.fileUploadShow = true;
      this.showFileError = false;
    }
    this.formSubmit.get('aisheCode')?.patchValue(this.instituteID[0].userName);
    this.formSubmit
      .get('mobileNumber')
      ?.patchValue(this.instituteID[0].mobileNo);
    this.formSubmit.get('state')?.patchValue(this.instituteID[0].stateName);
    this.formSubmit
      .get('district')
      ?.patchValue(this.instituteID[0].districtName);
    this.formSubmit.get('address1')?.patchValue(this.instituteID[0].address1);
    if (this.instituteID[0].address2) {
      this.formSubmit.get('address2')?.patchValue(this.instituteID[0].address2);
    } else {
      this.formSubmit.get('address2')?.patchValue('NA');
    }
    this.formSubmit.get('query')?.patchValue(this.instituteID[0].query);
    if (this.registeredOrNot) {
      this.formSubmit.get('fullname')?.patchValue(this.instituteID[0].name);
      this.formSubmit.get('emailId')?.patchValue(this.instituteID[0].emailId);
    }
    if (this.instituteID[0]?.grievanceStatus !== null) {
      this.formSubmit
        .get('grievanceStatus')
        ?.patchValue(this.instituteID[0]?.grievanceStatus);
    } else {
      this.formSubmit.get('grievanceStatus')?.patchValue('Pending');
    }
  }

  getInoMainIssueCetrgoryList() {
    this.LoaderService.showLoader();
    this._common
      .getInoMainIssueCetrgoryList()
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

  getMinistriesList() {
    this.LoaderService.showLoader();
    this._common
      .getMinistriesList()
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.LoaderService.hideLoader();

          if (Array.isArray(res.data) && res.data.length > 0) {
            this.ministriesData = res.data;
          }
        },
        error: (error) => {
          if (error) {
            this._common.errorLogging();
          }
        },
      });
  }

  onMinistryChange(event: any) {
    this.LoaderService.showLoader();
    const data = event.value;
    this._common
      .getMinistrySchemeList(data)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.LoaderService.hideLoader();

          if (Array.isArray(res.data) && res.data.length > 0) {
            this.schemeData = res.data;
          }
        },
        error: (error) => {
          if (error) {
            this._common.errorLogging();
          }
        },
      });
  }

  getState() {
    this.LoaderService.showLoader();
    this._common
      .getState()
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.LoaderService.hideLoader();
          if (res.status === 'SUCCESS') this.stateList = res.data;
        },
        error: (error: any) => {
          if (error) {
            this._common.errorLogging();
          }
        },
      });
  }

  getDistrictListUsingStateId(event: any) {
    this.LoaderService.showLoader();
    const data = event.value;
    this._common
      .getDistrictListUsingStateId(data)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.LoaderService.hideLoader();
          if (res.status === 'SUCCESS') {
            this.districtList = res.data;
          }
        },
        error: (error: any) => {
          if (error) {
            this._common.errorLogging();
          }
        },
      });
  }

  getInoDetails() {
    this.formSubmit.get('fullname')?.clearValidators();
    this.formSubmit.get('emailId')?.clearValidators();
    this.formSubmit.get('gender')?.clearValidators();
    this.formSubmit.get('fullname')?.updateValueAndValidity();
    this.formSubmit.get('emailId')?.updateValueAndValidity();
    this.formSubmit.get('gender')?.updateValueAndValidity();
    let payload = {
      aisheCode: this.aisheCode,
    };
    payload = this.encryptionService.encrypt(payload);
    this._common
      .getInoDetails(payload)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          if (res?.status == 'SUCCESS') {
            this.inoDetails = JSON.parse(
              this.encryptionService.decrypt(res?.data[0])
            );
            sessionStorage.setItem(
              'mobileNo',
              this.encryptionService.encrypt(this.inoDetails[0]?.mobileNo)
            );
            this.formSubmit
              .get('aisheCode')
              ?.patchValue(this.inoDetails[0]?.instituteAisheCode);
            this.formSubmit
              .get('emailId')
              ?.patchValue(this.inoDetails[0]?.emailId);
            this.formSubmit
              .get('mobileNumber')
              ?.patchValue(this.inoDetails[0]?.mobileNo);
            this.formSubmit
              .get('district')
              ?.patchValue(this.inoDetails[0]?.districtName);
            this.formSubmit
              .get('state')
              ?.patchValue(this.inoDetails[0]?.stateName);
          }
        },
        error: (error) => {
          if (error) {
            this._common.errorLogging();
          }
        },
      });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!this.isSafePdfFileName(file.name)) {
        this.AlertService.swalPopErrorTimer('Invalid File Format.');
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
    this.downloadPdfFromBase64(this.instituteID[0]?.file);
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
    if (
      this.formSubmit.valid &&
      this.formSubmit.get('address1')?.value !== '' &&
      this.formSubmit.get('query')?.value !== ''
    ) {
      this.LoaderService.showLoader();
      let payload = {};
      if (!this.registeredOrNot) {
        payload = {
          aisheCode: this.formSubmit.get('aisheCode')?.value,
          mainIssueCategory: this.formSubmit.get('mainIssueCategory')?.value,
          ministryId: this.formSubmit.get('ministryId')?.value,
          schemeId: this.formSubmit.get('schemeId')?.value,
          address1: this.formSubmit.get('address1')?.value.trim(),
          address2: this.formSubmit.get('address2')?.value.trim(),
          query: this.formSubmit.get('query')?.value.trim(),
          emailId: this.formSubmit.get('emailId')?.value,
          file: this.base64,
          registeredOrNot: 'Yes',
        };
      } else {
        payload = {
          aisheCode: this.formSubmit.get('aisheCode')?.value,
          mobileNo: this.formSubmit.get('mobileNumber')?.value,
          mainIssueCategory: this.formSubmit.get('mainIssueCategory')?.value,
          ministryId: this.formSubmit.get('ministryId')?.value,
          schemeId: this.formSubmit.get('schemeId')?.value,
          address1: this.formSubmit.get('address1')?.value.trim(),
          address2: this.formSubmit.get('address2')?.value.trim(),
          query: this.formSubmit.get('query')?.value.trim(),
          emailId: this.formSubmit.get('emailId')?.value,
          file: this.base64,
          registeredOrNot: 'No',
          fullName: this.formSubmit.get('fullname')?.value,
          stateId: this.formSubmit.get('state')?.value,
          districtId: this.formSubmit.get('district')?.value,
          gender: this.formSubmit.get('gender')?.value,
        };
      }
      const encData = this.encryptionService.encrypt(payload);
      this._common
        .saveInoGrievance(encData)
        .pipe(takeUntil(this.unSubscribeSubject))
        .subscribe({
          next: (res: any) => {
            this.LoaderService.hideLoader();
            if (res.status === 'FAIL') {
              if (res.error) {
                this.AlertService.swalPopError(res.error.fieldError.error);
              }
            } else {
              if (res.status === 'SUCCESS') {
                let registrationNumber = this.encryptionService.decrypt(
                  res?.data?.[0]
                );
                registrationNumber = JSON.parse(registrationNumber);
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  html: `Grievance registration successfully. Your registration number is <b>${registrationNumber[0]?.grievanceRegistrationNumber}</b>.`,
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
                      'institute-dashBoard/institute-all-grivenceList',
                    ]);
                  }
                });
              }
            }
          },
          error: (error) => {
            if (error) {
              this._common.errorLogging();
            }
          },
        });
    } else {
      this.formSubmit.markAllAsTouched();
      this.AlertService.swalPopError('Please fill all required fields.');
    }
  }


  ngOnDestroy(): void {
    localStorage.removeItem('viewMode');
    sessionStorage.removeItem('viewMode');
  }
}

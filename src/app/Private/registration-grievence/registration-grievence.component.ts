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
import { EncDescServiceService } from '../../Common/enc-desc-service.service';
import { LoaderService } from '../../Common/../Service/loader.service';
import { AlertService } from '../../Service/alert.service';
import { CommonService } from '../../Service/common.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-registration-grievence',
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
  templateUrl: './registration-grievence.component.html',
  styleUrl: './registration-grievence.component.scss',
})
export class RegistrationGrievenceComponent implements OnInit, OnDestroy {
  formSubmit!: FormGroup;
  unSubscribeSubject: Subject<any> = new Subject();
  stateData: any;
  applicationId: any;
  ministriesData: any;
  schemeData: any;
  getStudentMainIssue: any;
  decryptData: any;
  mainIssueData: any;
  subIssueData: any;
  base64: any;
  ministryNameToggle: boolean = false;
  fileUploadShow: boolean = false;
  showFileError: boolean = true;
  datainParams: any;
  registeredOrNot: boolean = false;
  registeredOrNotValue: any;
  stateList: any;
  districtList: any;
  usermobilenumnber: any;
  showgenderdropdown: boolean = true;
  registrationNo: any;
  constructor(
    private _fb: FormBuilder,
    private encryptionService: EncDescServiceService,
    private LoaderService: LoaderService,
    private AlertService: AlertService,
    private CommonService: CommonService,
    private router: Router
  ) {
    this.formSubmit = this.getAllformControlls();

    let decryptedData: string | null =
      sessionStorage.getItem('registeredOrNot');
    let decryptedData2: string | null = sessionStorage.getItem('applicantName');

    if (decryptedData2) {
      this.usermobilenumnber = JSON.parse(
        this.encryptionService.decrypt(decryptedData2)
      );
    }

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
      this.applicationId = JSON.parse(data);
    }

    this.getMinistriesList();
    this.getStudentMainIssueCetrgoryList();
  }

  ngOnInit() {
    if (this.registeredOrNot) {
      this.getState();
      this.formSubmit.get('applicationId')?.patchValue(this.usermobilenumnber);
      this.formSubmit.get('mobileNo')?.patchValue(this.usermobilenumnber);
    }
    if (this.applicationId) {
      this.proceedWithApplicationsId();
    } else {
      if (!this.registeredOrNot) {
        this.getApplicantDetails();
      }
    }
  }

  getAllformControlls() {
    return this._fb.group({
      applicationId: ['', [Validators.required]],
      mobileNo: ['', [Validators.required]],
      stateName: ['', [Validators.required]],
      district: ['', [Validators.required]],
      mainIssueCategory: ['', [Validators.required]],
      subIssueCategory: ['', [Validators.required]],
      ministryId: ['', [Validators.required]],
      ministryId1: [''],
      schemeId: ['', [Validators.required]],
      schemeId1: [''],
      fullName: ['', [Validators.required]],
      gender: ['', [Validators.required]],
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
          this.onlyAllowedCharactersValidator(),
          this.noOnlyWhitespaceValidator(),
          Validators.pattern(/^(?!.*000).+$/),
        ],
      ],
      emailId: ['', [Validators.required, Validators.email]],
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
      grievanceStatus: [''],
      getStudentMainIssue: [''],
    });
  }

  getMinistriesList() {
    this.LoaderService.showLoader();
    this.CommonService.getMinistriesList()
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
            this.CommonService.errorLogging();
          }
        },
      });
  }

  getState() {
    this.LoaderService.showLoader();
    this.CommonService.getState()
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.LoaderService.hideLoader();
          if (res.status === 'SUCCESS') this.stateList = res.data;
        },
        error: (error: any) => {
          if (error) {
            this.CommonService.errorLogging();
          }
        },
      });
  }

  getDistrictListUsingStateId(event: any) {
    this.LoaderService.showLoader();
    const data = event.value;
    this.CommonService.getDistrictListUsingStateId(data)
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
            this.CommonService.errorLogging();
          }
        },
      });
  }

  onMinistryChange(event: any) {
    this.LoaderService.showLoader();
    const data = event.value;
    this.CommonService.getMinistrySchemeList(data)
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
            this.CommonService.errorLogging();
          }
        },
      });
  }

  getStudentMainIssueCetrgoryList() {
    this.LoaderService.showLoader();
    this.CommonService.getStudentMainIssueCetrgoryList()
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
            this.CommonService.errorLogging();
          }
        },
      });
  }

  onIssueRelatedChange(event: any) {
    this.LoaderService.showLoader();
    const data = event.value;
    this.CommonService.getStudentSubIssueCetrgoryList(data)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.LoaderService.hideLoader();

          if (Array.isArray(res.data) && res.data.length > 0) {
            this.subIssueData = res.data;
          }
        },
        error: (error) => {
          if (error) {
            this.CommonService.errorLogging();
          }
        },
      });
  }
  proceedWithApplicationsId() {
    this.showgenderdropdown = false;

    const data = this.applicationId[0];
    let genderText = '';
    switch (data?.gender) {
      case 'M':
        genderText = 'Male';
        break;
      case 'F':
        genderText = 'Female';
        break;
      case 'O':
        genderText = 'Other';
        break;
      default:
        genderText = '';
    }
    if (
      this.applicationId[0].ministryName ||
      this.applicationId[0].schemeName
    ) {
      this.ministryNameToggle = true;
      this.formSubmit
        .get('ministryId1')
        ?.patchValue(this.applicationId[0].ministryName);
      this.formSubmit
        .get('schemeId1')
        ?.patchValue(this.applicationId[0].schemeName);
      this.formSubmit.get('file')?.disable();
    }
    if (this.applicationId[0]?.file) {
      this.fileUploadShow = true;
      this.showFileError = false;
    }
    this.formSubmit
      .get('applicationId')
      ?.patchValue(this.applicationId[0].applicationId);
    this.formSubmit.get('mobileNo')?.patchValue(this.applicationId[0].mobileNo);
    if (this.applicationId[0].applicantName) {
      this.formSubmit
        .get('fullName')
        ?.patchValue(this.applicationId[0].applicantName);
    } else {
      this.formSubmit
        .get('fullName')
        ?.patchValue(this.applicationId[0].fullName);
    }
    this.formSubmit.get('gender')?.patchValue(genderText);
    this.formSubmit.get('emailId')?.patchValue(this.applicationId[0].emailId);
    this.formSubmit
      .get('stateName')
      ?.patchValue(this.applicationId[0].stateName);
    if (this.applicationId[0].districtName) {
      this.formSubmit
        .get('district')
        ?.patchValue(this.applicationId[0].districtName);
    } else {
      this.formSubmit
        .get('district')
        ?.patchValue(this.applicationId[0].district);
    }
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

  submitFormData(formData: any) {
    if (this.formSubmit.valid) {
      this.LoaderService.showLoader();
      let data = {};

      if (!this.registeredOrNot) {
        data = {
          applicationId: JSON.parse(
            this.encryptionService.decrypt(
              sessionStorage.getItem('applicationId')
            )
          ),
          emailId: this.formSubmit.value.emailId,
          mainIssueCategory: this.formSubmit.value.mainIssueCategory,
          subIssueCategory: this.formSubmit.value.subIssueCategory,
          ministryId: this.formSubmit.value.ministryId,
          schemeId: this.formSubmit.value.schemeId,
          address1: this.formSubmit.value.address1.trim(),
          address2: this.formSubmit.value.address2.trim(),
          query: this.formSubmit.value.query.trim(),
          file: this.base64,
          registeredOrNot: 'Yes',
        };
      } else {
        data = {
          applicationId: this.formSubmit.value.applicationId,
          mobileNo: this.formSubmit.value.mobileNo,
          stateId: this.formSubmit.value.stateName,
          districtId: this.formSubmit.value.district,
          mainIssueCategory: this.formSubmit.value.mainIssueCategory,
          subIssueCategory: this.formSubmit.value.subIssueCategory,
          ministryId: this.formSubmit.value.ministryId,
          schemeId: this.formSubmit.value.schemeId,
          fullName: this.formSubmit.value.fullName,
          gender: this.formSubmit.value.gender,
          address1: this.formSubmit.value.address1.trim(),
          address2: this.formSubmit.value.address2.trim(),
          emailId: this.formSubmit.value.emailId,
          query: this.formSubmit.value.query.trim(),
          file: this.base64,
          registeredOrNot: 'No',
        };
      }
      const encData = this.encryptionService.encrypt(data);
      this.CommonService.registerStudentGrievance(encData)
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
                    this.router.navigate(['dashBoard/allGrivenceList']);
                  }
                });
              }
            }
          },

          error: (error) => {
            if (error) {
              this.CommonService.errorLogging();
            }
          },
        });
    } else if (this.formSubmit.invalid) {
      this.AlertService.swalPopError('Please fill all required fields.');
      this.formSubmit.markAllAsTouched();
    }
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

  getApplicantDetails() {
    this.LoaderService.showLoader();
    this.showgenderdropdown = false;
    let payload = {
      applicationId: JSON.parse(
        this.encryptionService.decrypt(sessionStorage.getItem('applicationId'))
      ),
    };
    payload = this.encryptionService.encrypt(payload);
    this.CommonService.getApplicantDetails(payload).subscribe({
      next: (res: any) => {
        this.LoaderService.hideLoader();
        let decryptData = this.encryptionService.decrypt(res?.data[0]);
        decryptData = JSON.parse(decryptData);
        const data = decryptData[0];
        let genderText = '';
        switch (data?.gender) {
          case 'M':
            genderText = 'Male';
            break;
          case 'F':
            genderText = 'Female';
            break;
          case 'O':
            genderText = 'Other';
            break;
          default:
            genderText = '';
        }
        this.formSubmit
          .get('applicationId')
          ?.patchValue(decryptData[0]?.applicationId);
        this.formSubmit.get('district')?.patchValue(decryptData[0]?.district);
        this.formSubmit.get('emailId')?.patchValue(decryptData[0]?.emailId);
        this.formSubmit.get('gender')?.patchValue(genderText);
        this.formSubmit.get('fullName')?.patchValue(decryptData[0]?.fullName);
        this.formSubmit.get('stateName')?.patchValue(decryptData[0]?.stateName);
        this.formSubmit.get('mobileNo')?.patchValue(decryptData[0]?.mobileNo);
        sessionStorage.setItem(
          'mobileNo',
          this.encryptionService.encrypt(decryptData[0]?.mobileNo)
        );
      },
      error: (err) => {
        if (err) {
          this.CommonService.errorLogging();
        }
      },
    });
  }

  verifyDocumentFileExtension(files: any) {
    var fileIndex = files[0].name.lastIndexOf('.') + 1;
    var extFile = files[0].name
      .substr(fileIndex, files[0].name.length)
      .toLowerCase();
    return extFile;
  }
  verifyFileSize(files: any) {
    var fileSize = files[0].size;
    return fileSize;
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


  


  

  ngOnDestroy(): void {
    localStorage.removeItem('viewMode');
    sessionStorage.removeItem('viewMode');
  }
}

import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonService } from '../../Service/common.service';
import { EncDescServiceService } from '../../Common/enc-desc-service.service';
import { Subject, takeUntil } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoaderService } from '../../Common/../Service/loader.service';
import { AlertService } from '../../Service/alert.service';
@Component({
  selector: 'app-view-all-application',
  standalone: true,
  imports: [RouterModule, CommonModule, MatTableModule, MatPaginatorModule],
  templateUrl: './view-all-application.component.html',
  styleUrl: './view-all-application.component.scss',
})
export class ViewAllApplicationComponent implements OnInit, AfterViewInit {
  unSubscribeSubject: Subject<any> = new Subject();
  allApplicationList!: MatTableDataSource<any>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = [
    'sn',
    'otr_id',
    'application_id',
    'academic_year',
    'fresh_renewal',
    'scholarship_incentive',
    'application_status',
    'action',
  ];

  constructor(
    private _common: CommonService,
    private encryptionService: EncDescServiceService,
    private router: Router,
    private LoaderService: LoaderService,
  ) {}

  ngOnInit(): void {
    this.getAllApplication();
  }

  ngAfterViewInit() {
    if (this.allApplicationList) {
      this.allApplicationList.paginator = this.paginator;
      this.allApplicationList.sort = this.sort;
    }
  }

  getAllApplication() {
    this.LoaderService.showLoader()
    const data = {
      otrId: JSON.parse(
        this.encryptionService.decrypt(sessionStorage.getItem('otr'))
      ),
      ay: JSON.parse(
        this.encryptionService.decrypt(sessionStorage.getItem('ay'))
      ),
    };
    const encdata = this.encryptionService.encrypt(data);
    this._common
      .getAllApplication(encdata)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this.LoaderService.hideLoader()
          if (res.status == 'SUCCESS') {
            const decryptedData = JSON.parse(
              this.encryptionService.decrypt(res.data[0])
            );
            decryptedData.sort((a: any, b: any) => {
              if (a.application_status === 1 && b.application_status !== 1)
                return -1;
              if (a.application_status !== 1 && b.application_status === 1)
                return 1;
              return 0;
            });
            this.allApplicationList = new MatTableDataSource(decryptedData);
            this.allApplicationList.paginator = this.paginator;
            this.allApplicationList.sort = this.sort;
          }
        },
        error: (error: any) => {
           if(error){
            this._common.errorLogging()
          }
        },
      });
  }

  formatAcademicYear(year: number): string {
    const startYear = Math.floor(year / 100);
    const endYear = year % 100;
    return `${startYear}-${endYear}`;
  }
  getFreshOrRenewal(freshRenewal: string): string {
    return freshRenewal === 'F'
      ? 'Fresh'
      : freshRenewal === 'R'
      ? 'Renewal'
      : '';
  }
  getScholarshipOrIncentive(data: string): string {
    return data === 'S' ? 'Scholarship' : data === 'I' ? 'Incentive' : '';
  }
  getApplicationStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'New';
      case 1:
        return 'Active';
      case 2:
        return 'Withdrawn';
      case 3:
        return 'Completed';
      default:
        return '';
    }
  }

  redirectWithParam(data: any) {
    let payload = {
      ay: data.academic_year,
      otrId: data.otr_id,
      applicationId: data.application_id,
    };
    const encryptedData = this.encryptionService.encrypt(payload);
    this._common
      .proceedWithApplicationsId(encryptedData)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
       
        next: (res: any) => {
          if (res.status =='SUCCESS') {
            const encdata=JSON.parse(this.encryptionService.decrypt(res.data[0]))
            sessionStorage.setItem('applicationId',this.encryptionService.encrypt(encdata[0].applicationId));
            sessionStorage.setItem('mobileNo',this.encryptionService.encrypt(encdata[0].mobileNo));
            sessionStorage.setItem('applicantName',this.encryptionService.encrypt(encdata[0].fullName));
             this.router.navigate(['/dashBoard/grivanceRegistration'])
          }
          
        },
        error: (error: any) => {
           if(error){
            this._common.errorLogging()
          }
          
        },
      });
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../../../Service/common.service';
import { Subject, takeUntil } from 'rxjs';
import { EncDescServiceService } from '../../../Common/enc-desc-service.service';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { AlertService } from '../../../Service/alert.service';
import { LoaderService } from '../../../Service/loader.service';

@Component({
  selector: 'app-all-grievance-list',
  standalone: true,
  imports: [RouterModule, MatTableModule, MatPaginatorModule, CommonModule],
  templateUrl: './all-grievance-list.component.html',
  styleUrl: './all-grievance-list.component.scss',
})
export class AllGrievanceListComponent implements OnInit {
  aisheCode: any;
  inoGrievanceDetails: any;
  allGrievanceList!: MatTableDataSource<any>;
  instituteId: any;
  unSubscribeSubject: Subject<any> = new Subject();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = [
    'sn',
    'registrationNo',
    'mobileNo',
    // 'query',
    'dateTime',
    'action',
  ];
  constructor(
    private _commonService: CommonService,
    private encryptionService: EncDescServiceService,
    private router: Router,
    private _alert: AlertService,
    private _loader: LoaderService
  ) {
    const data = this.encryptionService.decrypt(
      sessionStorage.getItem('InstituteName')
    );
    this.aisheCode = JSON.parse(data);

    // this.aisheCode = JSON.parse(
    //   this.encryptionService.decrypt(sessionStorage.getItem('InstituteName'))
    // );
  }

  ngOnInit(): void {
    this.getAllInoGrievanceList();
  }

  getAllInoGrievanceList() {
    this._loader.showLoader();
    let payload = {
      aisheCode: this.aisheCode,
    };
    const encData = this.encryptionService.encrypt(payload);
    this._commonService
      .getAllInoGrievanceList(encData)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this._loader.hideLoader();
          if (res?.status == 'SUCCESS') {
            this.inoGrievanceDetails = JSON.parse(
              this.encryptionService.decrypt(res?.data[0])
            );
            this.allGrievanceList = new MatTableDataSource(
              this.inoGrievanceDetails
            );
            this.allGrievanceList.paginator = this.paginator;
            this.allGrievanceList.sort = this.sort;
          }
        },
        error: (error) => {
          if (error) {
            this._commonService.errorLogging();
          }
        },
      });
  }

  getGrievanceDetailsAndStatus(data: any) {
    this._loader.showLoader();
    let payload = {
      userName: JSON.parse(
        this.encryptionService.decrypt(sessionStorage.getItem('InstituteName'))
      ),
      registrationNo: data.registrationNo,
    };
    payload = this.encryptionService.encrypt(payload);
    this._commonService
      .viewStatusAndGrievanceDetails(payload)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this._loader.hideLoader();
          if (res.status == 'SUCCESS') {
            const payload2 = {
              registrationNo: data.registrationNo,
              data: res.data[0],
            };
            const encpayload = this.encryptionService.encrypt(payload2);
            sessionStorage.setItem('viewMode',encpayload)
            this.router.navigate(
              ['/institute-dashBoard/institute-grivance-registration']);
          }
          if (res.status == 'FAIL') {
            this._loader.hideLoader();
            this._alert.swalPopError(res.error.fieldError.error);
          }
        },
        error: (error: any) => {
          if (error) {
            this._commonService.errorLogging();
          }
        },
      });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EncDescServiceService } from '../../../Common/enc-desc-service.service';
import { AlertService } from '../../../Service/alert.service';
import { CommonService } from '../../../Service/common.service';
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
  ) {}
  ngOnInit(): void {
    this.getNodalOfficerAllGrievanceList();
  }
  getNodalOfficerAllGrievanceList() {
    this._loader.showLoader();
    this._commonService
      .getNodalOfficerAllGrievanceList()
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this._loader.hideLoader();
          if (res.status == 'FAIL') {
            if (res.error) {
              this._alert.swalPopError(res.error.fieldError.error);
            }
          } else {
            if (res.status === 'SUCCESS') {
              const encdata = JSON.parse(
                this.encryptionService.decrypt(res.data[0])
              );
              this.allGrievanceList = new MatTableDataSource(encdata);
              this.allGrievanceList.paginator = this.paginator;
              this.allGrievanceList.sort = this.sort;
            }
          }
        },
        error: (error) => {
          if(error){
            this._commonService.errorLogging()
          }
        },
      });
  }

  getGrievanceDetailsAndStatus(data: any) {
    this._loader.showLoader();
    let payload = {
      registrationNo: data.registrationNo,
    };
    payload = this.encryptionService.encrypt(payload);
    this._commonService
      .getNodalOfficerGrievanceDetailsAndStatus(payload)
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

            this.router.navigate(
              ['/ministry-dashBoard/ministry-grivance-registration'],
              {
                queryParams: { id: encpayload },
              }
            );
          }
          if (res.status == 'FAIL') {
            this._loader.hideLoader();
            this._alert.swalPopError(res.error.fieldError.error);
          }
        },
        error: (error: any) => {
          if(error){
            this._commonService.errorLogging()
          }
        },
      });
  }
}

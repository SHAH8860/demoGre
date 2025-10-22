import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonService } from '../../Service/common.service';
import { EncDescServiceService } from '../../Common/enc-desc-service.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { LoaderService } from '../../Service/loader.service';
import { AlertService } from '../../Service/alert.service';

@Component({
  selector: 'app-all-grievance-list',
  standalone: true,
  imports: [RouterModule, MatTableModule, MatPaginatorModule, CommonModule],
  templateUrl: './all-grievance-list.component.html',
  styleUrl: './all-grievance-list.component.scss',
})
export class AllGrievanceListComponent implements OnInit {
  unSubscribeSubject: Subject<any> = new Subject();
  applicationId: any;
  allGrievanceList!: MatTableDataSource<any>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = [
    'sn',
    "application_id",
    'registrationNo',
    'mobileNo',
    'dateTime',
    'action',
    
    
  ];
  constructor(
    private _commonService: CommonService,
    private encryptionService: EncDescServiceService,
    private _loader: LoaderService,
    private router: Router,
    private _alert: AlertService
  ) {}

  ngOnInit(): void {
     this.applicationId = JSON.parse(
      this.encryptionService.decrypt(sessionStorage.getItem('applicationId'))
    );
    this.getAllGrievanceList();
  }

  getAllGrievanceList() {
    this._loader.showLoader();
    let payload = {
      applicationId: this.applicationId,
    };
    payload = this.encryptionService.encrypt(payload);
    this._commonService
      .getAllGrievanceList(payload)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          this._loader.hideLoader();
           if (res.status == 'FAIL') {
            if (res.error) {
              this._alert.swalPopError(res.error.fieldError.error);
            }
          }else{
          if (res.status == 'SUCCESS') {
            const decryptedData = JSON.parse(
              this.encryptionService.decrypt(res.data[0])
            );
            this.allGrievanceList = new MatTableDataSource(decryptedData);
            this.allGrievanceList.paginator = this.paginator;
            this.allGrievanceList.sort = this.sort;
            this._loader.hideLoader();
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
    let payload = {
      applicationId: JSON.parse(
        this.encryptionService.decrypt(sessionStorage.getItem('applicationId'))
      ),
      registrationNo: data.registrationNo,
    };
    payload = this.encryptionService.encrypt(payload);
    this._commonService
      .getGrievanceDetailsAndStatus(payload)
      .pipe(takeUntil(this.unSubscribeSubject))
      .subscribe({
        next: (res: any) => {
          if (res.status == 'SUCCESS') {
            const payload2={
              registrationNo: data.registrationNo,
              data:res.data[0]

            }
            const encpayload = this.encryptionService.encrypt(payload2);
            sessionStorage.setItem('viewMode',encpayload)
            this.router.navigate(['/dashBoard/grivanceRegistration'])
          }
          if (res.status == 'FAIL') {
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

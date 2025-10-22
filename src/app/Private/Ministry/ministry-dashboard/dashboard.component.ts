import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EncDescServiceService } from '../../../Common/enc-desc-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  applicantName:any;
  userType:any;
  constructor(private _router: ActivatedRoute, private encryptionService: EncDescServiceService,) {
    this.applicantName=JSON.parse(this.encryptionService.decrypt(sessionStorage.getItem('applicantName'))) 
    this.userType=JSON.parse(this.encryptionService.decrypt(sessionStorage.getItem('userType')))

  }
}

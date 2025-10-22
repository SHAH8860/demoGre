import { Component } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { EncDescServiceService } from '../../Common/enc-desc-service.service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  loginWithApplication: boolean = true;
  applicantName:string=''


  constructor(private location: Location, private encryptionService: EncDescServiceService,) {
    if((!sessionStorage.getItem('otr'))){
     this.loginWithApplication=false 
      }
      if(sessionStorage.getItem('applicantName')){
        this.applicantName=JSON.parse(
      this.encryptionService.decrypt(sessionStorage.getItem('applicantName'))) 

      }
      
  }
   goBack(): void {
    this.location.back();
  }
}

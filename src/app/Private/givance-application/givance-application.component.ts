import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { EncDescServiceService } from '../../Common/enc-desc-service.service';

@Component({
  selector: 'app-givance-application',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './givance-application.component.html',
  styleUrl: './givance-application.component.scss'
})
export class GivanceApplicationComponent {
  applicantName:string=''
  constructor(private location: Location,private encryptionService: EncDescServiceService) {
     if(sessionStorage.getItem('applicantName')){
        this.applicantName=JSON.parse(
      this.encryptionService.decrypt(sessionStorage.getItem('applicantName'))) 

      }
  }
  goBack(): void {
    this.location.back();
  }

}

import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EncDescServiceService } from '../../../Common/enc-desc-service.service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  instituteName: any;
  userType: any;
  constructor(private encryptionService: EncDescServiceService, private location: Location) {
    if (sessionStorage.getItem('InstituteName')) {
      this.instituteName = JSON.parse(
        this.encryptionService.decrypt(sessionStorage.getItem('InstituteName')))
    }
    if (sessionStorage.getItem('userType')) {
      this.userType = JSON.parse(
        this.encryptionService.decrypt(sessionStorage.getItem('userType')))
    }
  }

  backToPreviousPage() {
    this.location.back();
  }


}

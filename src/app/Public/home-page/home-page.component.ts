import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {


  constructor(
    private router : Router
  ){

  }
  ngOnInit(): void {
    
  }

  redirectTo(data:any){ 
    if(data == 'applicant'){
      this.router.navigateByUrl('/login-applicant')
    }else if(data === 'insttute'){
      this.router.navigateByUrl('/login-institute')
    }else if(data === 'ministry'){
      this.router.navigateByUrl('/login-ministry')
    }
  }
}

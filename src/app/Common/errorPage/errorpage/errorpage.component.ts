import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-errorpage',
  standalone: true,
  imports: [],
  templateUrl: './errorpage.component.html',
  styleUrl: './errorpage.component.scss'
})
export class ErrorpageComponent {
  constructor( private router: Router,){}

  loginAgain(){
    localStorage.clear();
      sessionStorage.clear();
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      this.router.navigate(['/home']);
  }

}

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../Service/alert.service';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../Service/common.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit{
  token: any;
  constructor(private router: Router, private _alert: AlertService,private _common:CommonService) {}

  ngOnInit() {
    this._common.token$.subscribe(token => {
    this.token = token;
  });
  }
  logout() {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this._common.removeToken();
    this._alert.swalPopSuccess('Logged out successfully');
    this.router.navigateByUrl('/home');
  }
}

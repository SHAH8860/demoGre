import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Common/header/header.component';
import { FooterComponent } from './Common/footer/footer.component';
import { CommonModule } from '@angular/common';
import { LoaderService } from './Service/loader.service';
import { AlertService } from './Service/alert.service';
import { CommonService } from './Service/common.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewChecked {
  title = 'grievence';
  constructor(
    public loaderService: LoaderService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private _common: CommonService
  ) {}
  ngOnInit(): void {
    this.loaderService.isLoading.subscribe(() => {
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 1000);
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });

    
    if (sessionStorage.getItem('token')) {
    if (performance.navigation.type === 1) {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      this._common.tokenSubject.next(null)
      this.router.navigate(['/page-not-found']);
      
    }
  }
  }
  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
}

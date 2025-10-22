import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor() { }

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading: Observable<boolean> = this.isLoadingSubject.asObservable();

   showLoader() {
    this.isLoadingSubject.next(true);
  }

  hideLoader() {
    this.isLoadingSubject.next(false);
  }

}

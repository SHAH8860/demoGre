import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  swalPopSuccess(textMsg: string) {
    Swal.fire({
      position: 'center',
      icon: 'success',
      text: textMsg,
      showConfirmButton: true,
    });
  }

  swalPopError(textMsg: string) {
    Swal.fire({
      position: 'center',
      icon: 'error',
      text: textMsg,
      showConfirmButton: true,
    });
  }

  swalPopSuccessTimer(textMsg: string) {
    Swal.fire({
      position: 'center',
      icon: 'success',
      text: textMsg,
      timer: 3000,
    });
  }

  swalPopErrorTimer(textMsg: string) {
    Swal.fire({
      position: 'center',
      icon: 'error',
      text: textMsg,
      timer: 5000,
    });
  }

  swalPopWarningTimer(textMsg: string) {
    Swal.fire({
      position: 'center',
      icon: 'warning',
      text: textMsg,
      timer: 10000,
    });
  }

  swalPopWarning(textMsg: string) {
    Swal.fire({
      position: 'center',
      icon: 'warning',
      text: textMsg,
      showConfirmButton: true,
    });
  }

  ShowWarning(title: string, timer?: number, body?: string | number, showConfirmButton?: boolean, confirmBtnText?: string) {
    Swal.fire({
      html: '<b>' + body + '</b>',
      position: 'center',
      title: title + '!',
      showConfirmButton: showConfirmButton ? showConfirmButton : false,
      // confirmButtonColor: "#1f91c0",
      confirmButtonText: confirmBtnText ? confirmBtnText : 'Ok',
      timer: timer,
      // width: 600,
      heightAuto: false,
    });
  }

  showConfirmation(title: string, text: string, confirmButtonText: string) {
    return Swal.fire({
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText,
    });
  }
  showConfirmation1(title: string, confirmButtonText: string) {
    return Swal.fire({
      title: title,
      // text: text,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText,
    });
  }
}

import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Alert {
  success(message: string, title: string = "Success") {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#3085d6'
    });
  }

  // Error Alert
  error(message: string, title: string = "Error") {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#d33'
    });
  }

  // Warning Alert
  warning(message: string, title: string = "Warning") {
    Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonColor: '#f6c23e'
    });
  }

  // Info Alert
  info(message: string, title: string = "Info") {
    Swal.fire({
      title: title,
      text: message,
      icon: 'info',
      confirmButtonColor: '#17a2b8'
    });
  }

  // Delete Confirmation
  confirmDelete(message: string = "Are you sure you want to delete?") {
    return Swal.fire({
      title: "Confirm Delete",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33"
    });
  }

  // Custom Toast (top right popup)
  toast(message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') {
    Swal.fire({
      toast: true,
      icon: icon,
      title: message,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

}

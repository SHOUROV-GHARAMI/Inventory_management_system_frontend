import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) { }

  success(message: string, title: string = 'Success'): void {
    this.toastr.success(message, title);
  }

  error(message: string, title: string = 'Error'): void {
    this.toastr.error(message, title);
  }

  warning(message: string, title: string = 'Warning'): void {
    this.toastr.warning(message, title);
  }

  info(message: string, title: string = 'Info'): void {
    this.toastr.info(message, title);
  }

  /**
   * Show error from HTTP response
   */
  showHttpError(error: any, defaultMessage: string = 'An error occurred'): void {
    let errorMessage = defaultMessage;

    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.error?.title) {
      errorMessage = error.error.title;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error?.error === 'string') {
      errorMessage = error.error;
    }

    this.error(errorMessage);
  }

  /**
   * Show validation errors from API
   */
  showValidationErrors(error: any): void {
    if (error?.error?.errors) {
      const errors = error.error.errors;
      Object.keys(errors).forEach(key => {
        const messages = errors[key];
        if (Array.isArray(messages)) {
          messages.forEach(msg => this.error(msg, 'Validation Error'));
        } else {
          this.error(messages, 'Validation Error');
        }
      });
    } else {
      this.showHttpError(error, 'Validation failed');
    }
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toastr.clear();
  }
}

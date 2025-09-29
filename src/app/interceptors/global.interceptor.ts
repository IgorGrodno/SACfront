import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../shared/services/storage.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const globalInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const storageService = inject(StorageService);
  const token = storageService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Произошла ошибка при выполнении запроса';

      if (error.error?.message) {
        // Если Spring вернул JSON с message
        errorMessage = error.error.message;
      }

      switch (error.status) {
        case 401:
        case 403:
          console.warn('Пользователь не авторизован, перенаправляем на /login');
          router.navigate(['/login']);
          break;

        case 404:
          console.warn('Ресурс не найден');
          alert(errorMessage || 'Запрашиваемый ресурс не найден');
          break;

        case 409:
          console.warn('Конфликт данных');
          alert(errorMessage || 'Операция невозможна: конфликт данных');
          break;

        case 500:
          console.error('Внутренняя ошибка сервера', error);
          alert(errorMessage || 'Произошла ошибка на сервере');
          break;

        default:
          console.error('Необработанная ошибка:', error);
          alert(errorMessage);
      }

      return throwError(() => error);
    })
  );
};

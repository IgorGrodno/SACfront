import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const globalInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);

  // 🔹 Не добавляем Authorization, браузер сам отправит cookie
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Произошла ошибка при выполнении запроса';

      if (error.error?.message) {
        errorMessage = error.error.message;
      }

      switch (error.status) {
        case 401:
        case 403:
          console.warn('Пользователь не авторизован, перенаправляем на /login');
          router.navigate(['/login']);
          break;

        case 404:
          alert(errorMessage || 'Запрашиваемый ресурс не найден');
          break;

        case 409:
          alert(errorMessage || 'Операция невозможна: конфликт данных');
          break;

        case 500:
          alert(errorMessage || 'Произошла ошибка на сервере');
          break;

        default:
          alert(errorMessage);
      }

      return throwError(() => error);
    })
  );
};

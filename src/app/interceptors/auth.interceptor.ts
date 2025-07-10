import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { inject } from '@angular/core';

export const authenticationInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const storageService = inject(StorageService);
  const user = storageService.getUser();
  const userId = String(user.id);
  const headers: Record<string, string> = {};
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  req = req.clone({
    withCredentials: true,
    setHeaders: headers,
  });
  return next(req);
};

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Implement auth interceptor
  return next(req);
};

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Implement API interceptor
  return next(req);
};

export const coreInterceptors = [authInterceptor, apiInterceptor];

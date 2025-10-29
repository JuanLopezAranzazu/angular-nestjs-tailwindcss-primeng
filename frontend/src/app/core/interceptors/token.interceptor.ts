import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  throwError,
  filter,
  take,
  switchMap,
  catchError,
} from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: (req: HttpRequest<any>) => Observable<HttpEvent<any>>
): Observable<HttpEvent<any>> => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  if (isAuthRequest(req.url)) {
    return next(req);
  }

  const accessToken = tokenService.getAccessToken();
  if (accessToken) {
    req = addTokenToRequest(req, accessToken);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshRequest(req.url)) {
        return handle401Error(req, next, tokenService, authService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(
  req: HttpRequest<any>,
  token: string
): HttpRequest<any> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handle401Error(
  req: HttpRequest<any>,
  next: (req: HttpRequest<any>) => Observable<HttpEvent<any>>,
  tokenService: TokenService,
  authService: AuthService
): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = tokenService.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken().pipe(
        switchMap((response) => {
          isRefreshing = false;
          refreshTokenSubject.next(response.access_token);
          return next(addTokenToRequest(req, response.access_token));
        }),
        catchError((error) => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      isRefreshing = false;
      authService.logout();
      return throwError(() => new Error('No hay refresh token disponible'));
    }
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addTokenToRequest(req, token!)))
    );
  }
}

function isAuthRequest(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/register');
}

function isRefreshRequest(url: string): boolean {
  return url.includes('/auth/refresh');
}

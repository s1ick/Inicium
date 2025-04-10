import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, of } from 'rxjs';

export interface User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  selected?: boolean;
}

export interface UsersResponse {
  users: User[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly API_URL = 'https://test-data.directorix.cloud/task1';
  private readonly API_URL_BIG_DATA = 'https://run.mocky.io/v3/0ff5292a-4fa6-44d9-99fc-8bd64eabec2b';

  // ===== STATE WITH SIGNALS =====
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // ===== PUBLIC API =====

  readonly getUsers = (useBigData: boolean = false): Observable<UsersResponse> => {
    this.loading.set(true);
    this.error.set(null);

    const url = useBigData ? this.API_URL_BIG_DATA : this.API_URL;

    return this.http.get<UsersResponse>(url).pipe(
      catchError(error => {
        this.loading.set(false);
        this.error.set('Не удалось загрузить пользователей');
        console.error('API Error:', error);
        return of({ users: [] });
      })
    );
  };

  readonly getUsersSignal = (useBigData: boolean = false) => {
    return toSignal(this.getUsers(useBigData), {
      initialValue: { users: [] }
    });
  };
}

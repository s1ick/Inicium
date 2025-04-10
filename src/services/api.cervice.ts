import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.interface';
interface UsersResponse {
  users: User[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL: string = 'https://test-data.directorix.cloud/task1';
  //чуть больше данных
  private readonly Api_URL_BigData: string = 'https://run.mocky.io/v3/0ff5292a-4fa6-44d9-99fc-8bd64eabec2b'
  constructor(private http: HttpClient) {}

  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(this.API_URL);
  }
}

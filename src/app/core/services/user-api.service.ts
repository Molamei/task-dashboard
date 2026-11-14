import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../types/constants';
import { Assignee } from '../types/task.types';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<Assignee[]> {
    return this.http.get<Assignee[]>(API_ENDPOINTS.users);
  }
}

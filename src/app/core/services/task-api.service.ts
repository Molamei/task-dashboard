import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../types/constants';
import { StatisticsResponse } from '../types/statistic.types';
import { Task, TaskFormData, TasksResponse } from '../types/task.types';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);

  getTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(API_ENDPOINTS.tasks);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${API_ENDPOINTS.tasks}/${id}`);
  }

  createTask(formData: TaskFormData): Observable<Task> {
    const now = new Date().toISOString();
    const task: Omit<Task, 'id'> = {
      ...formData,
      assignee: { id: formData.assigneeId, name: '', avatar: '', email: '' },
      isOverdue: false,
      createdAt: now,
      updatedAt: now,
    };
    return this.http.post<Task>(API_ENDPOINTS.tasks, task);
  }

  updateTask(id: string, formData: Partial<TaskFormData>): Observable<Task> {
    return this.http.put<Task>(`${API_ENDPOINTS.tasks}/${id}`, {
      ...formData,
      updatedAt: new Date().toISOString(),
    });
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.tasks}/${id}`);
  }

  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(API_ENDPOINTS.statistics);
  }
}

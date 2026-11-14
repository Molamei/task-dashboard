import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../types/constants';
import { StatisticsResponse } from '../types/statistic.types';
import { Task, TaskFormData, TasksResponse } from '../types/task.types';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);

  getTasks(): Observable<TasksResponse> {
    return this.http.get<Task[]>(API_ENDPOINTS.tasks).pipe(
      map((tasks) => ({
        tasks,
        meta: { totalCount: tasks.length, lastUpdated: new Date().toISOString() },
      })),
    );
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${API_ENDPOINTS.tasks}/${id}`);
  }

  createTask(formData: TaskFormData): Observable<Task> {
    const now = new Date().toISOString();
    const name = formData.assigneeName.trim();
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .join('')
      .slice(0, 2);

    // Provide a client-generated id: angular-in-memory-web-api throws when it tries
    // to auto-generate ids for collections with non-numeric existing ids (e.g. "task-001").
    const task: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate,
      assignee: { id: `user-${Date.now()}`, name, avatar: initials || '?', email: '' },
      tags: formData.tags,
      isOverdue: false,
      createdAt: now,
      updatedAt: now,
    };
    return this.http.post<Task>(API_ENDPOINTS.tasks, task);
  }

  /** Sends the full merged entity via PUT to avoid wiping existing fields. */
  updateTask(id: string, existing: Task, formData: Partial<TaskFormData>): Observable<Task> {
    const rawName = formData.assigneeName?.trim();
    const assignee = rawName
      ? {
          ...existing.assignee,
          name: rawName,
          avatar:
            rawName
              .split(' ')
              .filter(Boolean)
              .map((w) => w[0].toUpperCase())
              .join('')
              .slice(0, 2) || '?',
        }
      : existing.assignee;

    const updatedTask: Task = {
      ...existing,
      title: formData.title ?? existing.title,
      description: formData.description ?? existing.description,
      status: formData.status ?? existing.status,
      priority: formData.priority ?? existing.priority,
      dueDate: formData.dueDate ?? existing.dueDate,
      assignee,
      tags: formData.tags ?? existing.tags,
      updatedAt: new Date().toISOString(),
    };
    return this.http.put<Task>(`${API_ENDPOINTS.tasks}/${id}`, updatedTask);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.tasks}/${id}`);
  }

  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(API_ENDPOINTS.statistics);
  }
}

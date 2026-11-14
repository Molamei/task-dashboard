import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of, throwError } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { API_ENDPOINTS } from '../types/constants';
import { StatisticsResponse } from '../types/statistic.types';
import { Assignee, Task, TaskFormData, TasksResponse } from '../types/task.types';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);

  /**
   * Signal-based HTTP resources (Angular 21). Each resource fires its GET request
   * immediately and exposes the result as signals (.value, .isLoading, .error).
   * Mutations call .reload() after completing so the resource stays in sync.
   */
  readonly tasksResource = httpResource<Task[]>(() => API_ENDPOINTS.tasks);
  readonly statisticsResource = httpResource<StatisticsResponse>(() => API_ENDPOINTS.statistics);

  /**
   * Observable bridge for NgRx Effects. Calls reload() to ensure fresh data, then
   * waits for the resource to finish loading before emitting exactly once.
   */
  getTasks(): Observable<TasksResponse> {
    if (!this.tasksResource.isLoading()) {
      this.tasksResource.reload();
    }
    return toObservable(this.tasksResource.isLoading, { injector: this.injector }).pipe(
      filter((loading) => !loading),
      take(1),
      switchMap(() => {
        const error = this.tasksResource.error();
        if (error) {
          return throwError(() => (error instanceof Error ? error : new Error(String(error))));
        }
        const tasks = this.tasksResource.value()!;
        return of({
          tasks,
          meta: { totalCount: tasks.length, lastUpdated: new Date().toISOString() },
        });
      }),
    );
  }

  getStatistics(): Observable<StatisticsResponse> {
    if (!this.statisticsResource.isLoading()) {
      this.statisticsResource.reload();
    }
    return toObservable(this.statisticsResource.isLoading, { injector: this.injector }).pipe(
      filter((loading) => !loading),
      take(1),
      switchMap(() => {
        const error = this.statisticsResource.error();
        if (error) {
          return throwError(() => (error instanceof Error ? error : new Error(String(error))));
        }
        return of(this.statisticsResource.value()!);
      }),
    );
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${API_ENDPOINTS.tasks}/${id}`);
  }

  createTask(formData: TaskFormData): Observable<Task> {
    return this.http.get<Assignee>(`${API_ENDPOINTS.users}/${formData.assigneeId}`).pipe(
      switchMap((assignee) => {
        const now = new Date().toISOString();
        // Client-generated id: angular-in-memory-web-api fails to auto-generate ids
        // for collections whose existing ids are non-numeric strings (e.g. "task-001").
        const task: Task = {
          id: `task-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate,
          assignee,
          tags: formData.tags,
          isOverdue: false,
          createdAt: now,
          updatedAt: now,
        };
        return this.http.post<Task>(API_ENDPOINTS.tasks, task);
      }),
    );
  }

  /** Sends the full merged entity via PUT to avoid wiping existing fields. */
  updateTask(id: string, existing: Task, formData: Partial<TaskFormData>): Observable<Task> {
    const resolveAssignee$ = formData.assigneeId
      ? this.http.get<Assignee>(`${API_ENDPOINTS.users}/${formData.assigneeId}`)
      : of(existing.assignee);

    return resolveAssignee$.pipe(
      switchMap((assignee) => {
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
      }),
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.tasks}/${id}`);
  }
}

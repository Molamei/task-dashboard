import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of, throwError } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { API_ENDPOINTS } from '../types/constants';
import { StatisticsResponse } from '../types/statistic.types';
import { Assignee, Task, TaskFormData, TasksResponse } from '../types/task.types';

/**
 * Handles all HTTP communication with the task API.
 *
 * Uses Angular's `httpResource` for signal-based reactive data fetching and
 * provides Observable bridges for NgRx Effects integration. Mutations (create,
 * update, delete) go through `HttpClient` directly and call `.reload()` on the
 * relevant resource to keep the signal state in sync.
 */
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
   * Observable bridge for NgRx Effects. Triggers a resource reload, then waits
   * for the loading flag to settle before emitting a single `TasksResponse`.
   * Propagates any resource-level error as an Observable error so Effects can
   * dispatch `loadTasksFailure`.
   *
   * @returns Observable that emits once with the full tasks payload.
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

  /**
   * Observable bridge for the statistics resource — mirrors the `getTasks` pattern.
   *
   * @returns Observable that emits once with the current statistics payload.
   */
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

  /**
   * Fetches a single task by its ID.
   *
   * @param id - The unique task identifier (e.g. `"task-001"`).
   * @returns Observable that emits the matching `Task`.
   */
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${API_ENDPOINTS.tasks}/${id}`);
  }

  /**
   * Creates a new task from the provided form data.
   *
   * Resolves the assignee object first via a GET to `/users/:id`, then POSTs the
   * fully-formed `Task` entity. The ID is generated client-side because
   * angular-in-memory-web-api cannot auto-generate IDs for collections whose
   * existing IDs are non-numeric strings (e.g. `"task-001"`).
   *
   * @param formData - Validated form values from the task creation form.
   * @returns Observable that emits the persisted `Task` returned by the API.
   */
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

  /**
   * Updates an existing task with partial form data.
   *
   * Sends the **full merged entity** via PUT rather than a PATCH to avoid wiping
   * existing fields that the in-memory API doesn't support partial updates for.
   * If `formData.assigneeId` is provided the assignee object is re-fetched;
   * otherwise the existing assignee is reused to avoid a redundant network call.
   *
   * @param id       - ID of the task to update.
   * @param existing - Current task snapshot used as the merge base.
   * @param formData - Partial form values; only provided fields overwrite `existing`.
   * @returns Observable that emits the updated `Task` returned by the API.
   */
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

  /**
   * Permanently deletes a task by ID.
   *
   * @param id - The unique identifier of the task to remove.
   * @returns Observable that completes once the DELETE request succeeds.
   */
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.tasks}/${id}`);
  }
}

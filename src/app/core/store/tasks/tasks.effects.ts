import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TaskApiService } from '../../services/task-api.service';
import { TaskActions } from './tasks.actions';
import { selectTasksLastFetched } from './tasks.selectors';

const CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly taskApi = inject(TaskApiService);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      withLatestFrom(this.store.select(selectTasksLastFetched)),
      switchMap(([, lastFetched]) => {
        if (lastFetched && Date.now() - lastFetched < CACHE_TTL_MS) {
          return of(TaskActions.loadTasksCacheHit());
        }
        return this.taskApi.getTasks().pipe(
          map(response => TaskActions.loadTasksSuccess({ response })),
          catchError(err => of(TaskActions.loadTasksFailure({ error: err.message }))),
        );
      }),
    ),
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTask),
      switchMap(({ formData }) =>
        this.taskApi.createTask(formData).pipe(
          map(task => TaskActions.createTaskSuccess({ task })),
          catchError(err => of(TaskActions.createTaskFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      switchMap(({ id, formData }) =>
        this.taskApi.updateTask(id, formData).pipe(
          map(task => TaskActions.updateTaskSuccess({ task })),
          catchError(err => of(TaskActions.updateTaskFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTask),
      switchMap(({ id }) =>
        this.taskApi.deleteTask(id).pipe(
          map(() => TaskActions.deleteTaskSuccess({ id })),
          catchError(err => of(TaskActions.deleteTaskFailure({ error: err.message }))),
        ),
      ),
    ),
  );
}

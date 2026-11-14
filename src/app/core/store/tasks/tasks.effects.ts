import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { TaskApiService } from '../../services/task-api.service';
import { ActivityActions } from '../activity/activity.actions';
import { TaskActions } from './tasks.actions';
import { selectAllTasks, selectTasksLastFetched } from './tasks.selectors';

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
          map((response) => TaskActions.loadTasksSuccess({ response })),
          catchError((err) => of(TaskActions.loadTasksFailure({ error: err.message }))),
        );
      }),
    ),
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTask),
      switchMap(({ formData }) =>
        this.taskApi.createTask(formData).pipe(
          map((task) => TaskActions.createTaskSuccess({ task })),
          catchError((err) => of(TaskActions.createTaskFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  createTaskActivity$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TaskActions.createTaskSuccess),
        tap(({ task }) =>
          this.store.dispatch(
            ActivityActions.addEvent({
              event: {
                id: `act-${Date.now()}`,
                type: 'task_created',
                taskId: task.id,
                taskTitle: task.title,
                timestamp: Date.now(),
              },
            }),
          ),
        ),
      ),
    { dispatch: false },
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      switchMap(({ id, existing, formData }) =>
        this.taskApi.updateTask(id, existing, formData).pipe(
          map((task) => TaskActions.updateTaskSuccess({ task })),
          catchError((err) => of(TaskActions.updateTaskFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  updateTaskActivity$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TaskActions.updateTaskSuccess),
        tap(({ task }) =>
          this.store.dispatch(
            ActivityActions.addEvent({
              event: {
                id: `act-${Date.now()}`,
                type: 'task_updated',
                taskId: task.id,
                taskTitle: task.title,
                timestamp: Date.now(),
                meta: { status: task.status },
              },
            }),
          ),
        ),
      ),
    { dispatch: false },
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTask),
      switchMap(({ id }) =>
        this.taskApi.deleteTask(id).pipe(
          map(() => TaskActions.deleteTaskSuccess({ id })),
          catchError((err) => of(TaskActions.deleteTaskFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  deleteTaskActivity$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TaskActions.deleteTask),
        withLatestFrom(this.store.select(selectAllTasks)),
        tap(([{ id }, tasks]) => {
          const title = tasks.find((t) => t.id === id)?.title ?? id;
          this.store.dispatch(
            ActivityActions.addEvent({
              event: {
                id: `act-${Date.now()}`,
                type: 'task_deleted',
                taskId: id,
                taskTitle: title,
                timestamp: Date.now(),
              },
            }),
          );
        }),
      ),
    { dispatch: false },
  );
}

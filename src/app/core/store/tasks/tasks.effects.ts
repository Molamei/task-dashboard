import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { TaskApiService } from '../../services/task-api.service';
import { ActivityActions } from '../activity/activity.actions';
import { TaskActions } from './tasks.actions';
import { selectAllTasks, selectTasksLastFetched } from './tasks.selectors';

/** How long a successful task fetch is considered fresh before a reload is triggered. */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Side-effect handlers for task-related NgRx actions.
 *
 * Covers the full CRUD lifecycle (load, create, update, delete) and automatically
 * appends a corresponding {@link ActivityEvent} to the activity feed after each
 * successful mutation. The `loadTasks$` effect also implements a client-side TTL
 * cache so repeated dispatches within the same session avoid redundant API calls.
 */
@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly taskApi = inject(TaskApiService);

  /**
   * Loads the task list from the API, with a 5-minute client-side cache.
   *
   * On every `loadTasks` dispatch, `lastFetched` is checked against the current
   * time. If the data is still within the TTL window, `loadTasksCacheHit` is
   * dispatched immediately and no HTTP request is made. Otherwise the API is
   * called and the result is normalised into `loadTasksSuccess` or
   * `loadTasksFailure`.
   */
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

  /**
   * Calls the API to persist a new task, then dispatches the success or failure
   * action. On success, `createTaskActivity$` fires as a side-effect to log the
   * event without coupling the reducer to activity concerns.
   */
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

  /**
   * Non-dispatching side-effect that records a `task_created` activity event
   * whenever a task is successfully created. Kept separate from `createTask$` so
   * the activity feed concern does not bleed into the core CRUD effect.
   */
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

  /**
   * Calls the API to update an existing task with the provided partial form data,
   * then dispatches the success or failure action.
   */
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

  /**
   * Non-dispatching side-effect that records a `task_updated` activity event,
   * including the new status in the event metadata for downstream display.
   */
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

  /**
   * Calls the API to delete a task by ID, then dispatches the success or failure
   * action. The reducer removes the task from local state on success.
   */
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

  /**
   * Non-dispatching side-effect that records a `task_deleted` activity event.
   * Reads the task title from the current store state (via `withLatestFrom`) so
   * the activity log remains human-readable even after the task is removed.
   */
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

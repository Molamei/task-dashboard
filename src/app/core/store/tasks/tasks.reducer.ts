import { createReducer, on } from '@ngrx/store';
import { TaskActions } from './tasks.actions';
import { initialTasksState } from './tasks.state';

/**
 * Pure reducer that manages the `tasks` feature slice.
 *
 * Key design decisions:
 * - Optimistic-free: state is only updated on `*Success` actions, never on the
 *   initiating action, keeping local state authoritative from the server.
 * - `loadTasksCacheHit` clears the loading flag without touching `tasks` or
 *   `lastFetched`, so the existing data continues to be shown.
 * - `setFilter` performs a **shallow merge** so callers only need to supply the
 *   dimensions they want to change; unspecified dimensions are preserved.
 * - `resetFilter` restores the initial filter object from `initialTasksState`
 *   rather than hard-coding nulls, ensuring a single source of truth.
 */
export const tasksReducer = createReducer(
  initialTasksState,

  /** Marks the fetch as in-flight and clears any previous error. */
  on(TaskActions.loadTasks, (state) => ({ ...state, loading: true, error: null })),
  /** Replaces the full task list and stamps `lastFetched` for cache TTL checks. */
  on(TaskActions.loadTasksSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    tasks: response.tasks,
    lastFetched: Date.now(),
  })),
  /** Preserves existing tasks on failure so the UI does not go blank. */
  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  /** Clears loading without modifying task data — the cache is still valid. */
  on(TaskActions.loadTasksCacheHit, (state) => ({ ...state, loading: false })),

  /** Appends the newly created task to the end of the list. */
  on(TaskActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task],
  })),

  /** Replaces the matching task in-place using the server-returned entity. */
  on(TaskActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
  })),

  /** Removes the deleted task by ID. */
  on(TaskActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((t) => t.id !== id),
  })),

  /** Merges partial filter changes, preserving dimensions not included in the action. */
  on(TaskActions.setFilter, (state, { filter }) => ({
    ...state,
    filter: { ...state.filter, ...filter },
  })),

  /** Restores all filter dimensions to their initial (no-op) values. */
  on(TaskActions.resetFilter, (state) => ({
    ...state,
    filter: initialTasksState.filter,
  })),
);

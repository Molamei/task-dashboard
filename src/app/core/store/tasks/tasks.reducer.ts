import { createReducer, on } from '@ngrx/store';
import { TaskActions } from './tasks.actions';
import { initialTasksState } from './tasks.state';

export const tasksReducer = createReducer(
  initialTasksState,

  on(TaskActions.loadTasks, state => ({ ...state, loading: true, error: null })),
  on(TaskActions.loadTasksSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    tasks: response.tasks,
    lastFetched: Date.now(),
  })),
  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(TaskActions.loadTasksCacheHit, state => ({ ...state, loading: false })),

  on(TaskActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task],
  })),

  on(TaskActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map(t => (t.id === task.id ? task : t)),
  })),

  on(TaskActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter(t => t.id !== id),
  })),

  on(TaskActions.setFilter, (state, { filter }) => ({
    ...state,
    filter: { ...state.filter, ...filter },
  })),

  on(TaskActions.resetFilter, state => ({
    ...state,
    filter: initialTasksState.filter,
  })),
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState } from './tasks.state';

/** Root selector for the `tasks` feature slice. */
export const selectTasksFeature = createFeatureSelector<TasksState>('tasks');

/** All tasks currently held in the store (unfiltered). */
export const selectAllTasks = createSelector(selectTasksFeature, (s) => s.tasks);
/** `true` while an API request for tasks is in-flight. */
export const selectTasksLoading = createSelector(selectTasksFeature, (s) => s.loading);
/** Non-null error message if the last task fetch failed. */
export const selectTasksError = createSelector(selectTasksFeature, (s) => s.error);
/** Active filter criteria applied to the task list. */
export const selectTasksFilter = createSelector(selectTasksFeature, (s) => s.filter);
/** Unix timestamp (ms) of the last successful fetch, or `null` if never fetched. */
export const selectTasksLastFetched = createSelector(selectTasksFeature, (s) => s.lastFetched);

/**
 * Returns the subset of tasks that match every active filter dimension.
 *
 * Filters are applied in order: status → priority → assignee → free-text search.
 * A `null` or empty value for any dimension is treated as "no constraint", so
 * tasks pass through unless a non-null filter explicitly excludes them.
 * The free-text search matches against both `title` and `description` (case-
 * insensitive) and is evaluated last because it is the most expensive check.
 */
export const selectFilteredTasks = createSelector(
  selectAllTasks,
  selectTasksFilter,
  (tasks, filter) =>
    tasks.filter((task) => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.assigneeId && task.assignee.id !== filter.assigneeId) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q);
      }
      return true;
    }),
);

/**
 * Returns a factory selector that finds a single task by its ID.
 *
 * @param id - The unique task identifier to look up.
 * @returns A memoized selector that emits the matching `Task` or `undefined`.
 */
export const selectTaskById = (id: string) =>
  createSelector(selectAllTasks, (tasks) => tasks.find((t) => t.id === id));

/**
 * Derives task counts grouped by status for the stat-card row and analytics.
 * `overdue` is a cross-cutting count based on the `isOverdue` flag and may
 * overlap with `todo` or `in_progress` tasks.
 */
export const selectTaskCountByStatus = createSelector(selectAllTasks, (tasks) => ({
  todo: tasks.filter((t) => t.status === 'todo').length,
  in_progress: tasks.filter((t) => t.status === 'in_progress').length,
  done: tasks.filter((t) => t.status === 'done').length,
  overdue: tasks.filter((t) => t.isOverdue).length,
}));

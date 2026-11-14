import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState } from './tasks.state';

export const selectTasksFeature = createFeatureSelector<TasksState>('tasks');

export const selectAllTasks = createSelector(selectTasksFeature, s => s.tasks);
export const selectTasksLoading = createSelector(selectTasksFeature, s => s.loading);
export const selectTasksError = createSelector(selectTasksFeature, s => s.error);
export const selectTasksFilter = createSelector(selectTasksFeature, s => s.filter);
export const selectTasksLastFetched = createSelector(selectTasksFeature, s => s.lastFetched);

export const selectFilteredTasks = createSelector(
  selectAllTasks,
  selectTasksFilter,
  (tasks, filter) =>
    tasks.filter(task => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.assigneeId && task.assignee.id !== filter.assigneeId) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q)
        );
      }
      return true;
    }),
);

export const selectTaskById = (id: string) =>
  createSelector(selectAllTasks, tasks => tasks.find(t => t.id === id));

export const selectTaskCountByStatus = createSelector(selectAllTasks, tasks => ({
  todo: tasks.filter(t => t.status === 'todo').length,
  in_progress: tasks.filter(t => t.status === 'in_progress').length,
  done: tasks.filter(t => t.status === 'done').length,
  overdue: tasks.filter(t => t.isOverdue).length,
}));

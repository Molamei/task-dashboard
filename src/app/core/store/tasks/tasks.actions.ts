import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Task, TaskFilter, TaskFormData, TasksResponse } from '../../types/task.types';

export const TaskActions = createActionGroup({
  source: 'Tasks',
  events: {
    'Load Tasks': emptyProps(),
    'Load Tasks Success': props<{ response: TasksResponse }>(),
    'Load Tasks Failure': props<{ error: string }>(),
    'Load Tasks Cache Hit': emptyProps(),

    'Create Task': props<{ formData: TaskFormData }>(),
    'Create Task Success': props<{ task: Task }>(),
    'Create Task Failure': props<{ error: string }>(),

    'Update Task': props<{ id: string; existing: Task; formData: Partial<TaskFormData> }>(),
    'Update Task Success': props<{ task: Task }>(),
    'Update Task Failure': props<{ error: string }>(),

    'Delete Task': props<{ id: string }>(),
    'Delete Task Success': props<{ id: string }>(),
    'Delete Task Failure': props<{ error: string }>(),

    'Set Filter': props<{ filter: Partial<TaskFilter> }>(),
    'Reset Filter': emptyProps(),
  },
});

import { Task, TaskFilter } from '../../types/task.types';

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
  lastFetched: number | null;
}

export const initialTasksState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  filter: {
    status: null,
    priority: null,
    assigneeId: null,
    search: '',
  },
  lastFetched: null,
};

import { Task, TaskFilter } from '../../types/task.types';

/**
 * Shape of the `tasks` NgRx feature slice.
 */
export interface TasksState {
  /** All tasks returned by the last successful API fetch. */
  tasks: Task[];
  /** `true` while the tasks API request is in-flight. */
  loading: boolean;
  /** Error message from the last failed fetch, or `null` when healthy. */
  error: string | null;
  /** Currently active filter criteria driving `selectFilteredTasks`. */
  filter: TaskFilter;
  /**
   * Unix timestamp (ms) of the last successful fetch.
   * Used by the effect TTL cache to avoid redundant API calls.
   * `null` before the first successful load.
   */
  lastFetched: number | null;
}

/** Starting value for the `tasks` slice — no tasks, no filter, never fetched. */
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

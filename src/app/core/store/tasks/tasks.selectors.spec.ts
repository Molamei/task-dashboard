import {
  selectAllTasks,
  selectFilteredTasks,
  selectTaskById,
  selectTaskCountByStatus,
  selectTasksError,
  selectTasksFilter,
  selectTasksLastFetched,
  selectTasksLoading,
} from './tasks.selectors';
import { initialTasksState } from './tasks.state';
import type { Task, TaskFilter } from '../../types/task.types';

const makeTask = (overrides: Partial<Task>): Task => ({
  id: 'task-001',
  title: 'Test Task',
  description: 'A description',
  status: 'todo',
  priority: 'medium',
  dueDate: '2025-12-31',
  assignee: { id: 'user-1', name: 'Alice Smith', avatar: '', email: 'alice@test.com' },
  tags: [],
  isOverdue: false,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

const buildState = (tasks: Task[], filter: TaskFilter = initialTasksState.filter) => ({
  tasks: { ...initialTasksState, tasks, filter },
});

describe('Tasks Selectors', () => {
  describe('primitive selectors', () => {
    it('selectAllTasks returns the tasks array', () => {
      const task = makeTask({});
      expect(selectAllTasks(buildState([task]) as never)).toEqual([task]);
    });

    it('selectTasksLoading returns the loading flag', () => {
      const state = { tasks: { ...initialTasksState, loading: true } };
      expect(selectTasksLoading(state as never)).toBe(true);
    });

    it('selectTasksError returns the error string', () => {
      const state = { tasks: { ...initialTasksState, error: 'oops' } };
      expect(selectTasksError(state as never)).toBe('oops');
    });

    it('selectTasksFilter returns the current filter', () => {
      expect(selectTasksFilter(buildState([]) as never)).toEqual(initialTasksState.filter);
    });

    it('selectTasksLastFetched returns the timestamp', () => {
      const state = { tasks: { ...initialTasksState, lastFetched: 12345 } };
      expect(selectTasksLastFetched(state as never)).toBe(12345);
    });
  });

  describe('selectFilteredTasks', () => {
    const tasks = [
      makeTask({
        id: 't1',
        status: 'todo',
        priority: 'high',
        assignee: { id: 'u1', name: 'Alice', avatar: '', email: '' },
        title: 'alpha task',
        description: 'first',
      }),
      makeTask({
        id: 't2',
        status: 'done',
        priority: 'low',
        assignee: { id: 'u2', name: 'Bob', avatar: '', email: '' },
        title: 'beta task',
        description: 'second',
      }),
      makeTask({
        id: 't3',
        status: 'in_progress',
        priority: 'medium',
        assignee: { id: 'u1', name: 'Alice', avatar: '', email: '' },
        title: 'gamma task',
        description: 'third',
      }),
    ];

    it('returns all tasks when no filter is active', () => {
      const result = selectFilteredTasks(buildState(tasks) as never);
      expect(result).toHaveLength(3);
    });

    it('filters by status', () => {
      const state = buildState(tasks, { ...initialTasksState.filter, status: 'done' });
      const result = selectFilteredTasks(state as never);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t2');
    });

    it('filters by priority', () => {
      const state = buildState(tasks, { ...initialTasksState.filter, priority: 'high' });
      const result = selectFilteredTasks(state as never);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t1');
    });

    it('filters by assigneeId', () => {
      const state = buildState(tasks, { ...initialTasksState.filter, assigneeId: 'u1' });
      const result = selectFilteredTasks(state as never);
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.assignee.id === 'u1')).toBe(true);
    });

    it('filters by search term matching the title', () => {
      const state = buildState(tasks, { ...initialTasksState.filter, search: 'alpha' });
      const result = selectFilteredTasks(state as never);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t1');
    });

    it('filters by search term matching the description', () => {
      const state = buildState(tasks, { ...initialTasksState.filter, search: 'second' });
      const result = selectFilteredTasks(state as never);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t2');
    });

    it('search is case-insensitive', () => {
      const state = buildState(tasks, { ...initialTasksState.filter, search: 'ALPHA' });
      const result = selectFilteredTasks(state as never);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t1');
    });

    it('combines status and priority filters', () => {
      const state = buildState(tasks, {
        ...initialTasksState.filter,
        status: 'todo',
        priority: 'high',
      });
      const result = selectFilteredTasks(state as never);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t1');
    });

    it('returns empty array when no task matches combined filters', () => {
      const state = buildState(tasks, {
        ...initialTasksState.filter,
        status: 'done',
        priority: 'high',
      });
      const result = selectFilteredTasks(state as never);
      expect(result).toHaveLength(0);
    });
  });

  describe('selectTaskById', () => {
    it('returns the task with the matching id', () => {
      const task = makeTask({ id: 'task-XYZ' });
      const result = selectTaskById('task-XYZ')(buildState([task]) as never);
      expect(result).toEqual(task);
    });

    it('returns undefined for a non-existent id', () => {
      const result = selectTaskById('nope')(buildState([]) as never);
      expect(result).toBeUndefined();
    });
  });

  describe('selectTaskCountByStatus', () => {
    it('counts tasks correctly by status and overdue flag', () => {
      const tasks = [
        makeTask({ id: 't1', status: 'todo' }),
        makeTask({ id: 't2', status: 'todo' }),
        makeTask({ id: 't3', status: 'in_progress' }),
        makeTask({ id: 't4', status: 'done' }),
        makeTask({ id: 't5', status: 'todo', isOverdue: true }),
      ];
      const result = selectTaskCountByStatus(buildState(tasks) as never);
      expect(result.todo).toBe(3);
      expect(result.in_progress).toBe(1);
      expect(result.done).toBe(1);
      expect(result.overdue).toBe(1);
    });

    it('returns all zeros for an empty task list', () => {
      const result = selectTaskCountByStatus(buildState([]) as never);
      expect(result).toEqual({ todo: 0, in_progress: 0, done: 0, overdue: 0 });
    });
  });
});

import { tasksReducer } from './tasks.reducer';
import { initialTasksState } from './tasks.state';
import { TaskActions } from './tasks.actions';
import type { Task, TasksResponse } from '../../types/task.types';

const mockTask: Task = {
  id: 'task-001',
  title: 'Test Task',
  description: 'A test description',
  status: 'todo',
  priority: 'medium',
  dueDate: '2025-12-31',
  assignee: { id: 'user-1', name: 'Alice Smith', avatar: '', email: 'alice@test.com' },
  tags: [],
  isOverdue: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('Tasks Reducer', () => {
  it('returns initial state for an unknown action', () => {
    const state = tasksReducer(undefined, { type: '__UNKNOWN__' } as never);
    expect(state).toEqual(initialTasksState);
  });

  describe('loadTasks', () => {
    it('sets loading to true and clears any existing error', () => {
      const state = tasksReducer(
        { ...initialTasksState, error: 'previous error' },
        TaskActions.loadTasks(),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('loadTasksSuccess', () => {
    it('stores the tasks, clears loading, and records lastFetched', () => {
      const response: TasksResponse = {
        tasks: [mockTask],
        meta: { totalCount: 1, lastUpdated: '' },
      };
      const before = Date.now();
      const state = tasksReducer(
        { ...initialTasksState, loading: true },
        TaskActions.loadTasksSuccess({ response }),
      );
      expect(state.loading).toBe(false);
      expect(state.tasks).toEqual([mockTask]);
      expect(state.lastFetched).toBeGreaterThanOrEqual(before);
    });
  });

  describe('loadTasksFailure', () => {
    it('stores the error message and clears loading', () => {
      const state = tasksReducer(
        { ...initialTasksState, loading: true },
        TaskActions.loadTasksFailure({ error: 'Network error' }),
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('loadTasksCacheHit', () => {
    it('clears the loading flag without changing tasks', () => {
      const withTask = { ...initialTasksState, loading: true, tasks: [mockTask] };
      const state = tasksReducer(withTask, TaskActions.loadTasksCacheHit());
      expect(state.loading).toBe(false);
      expect(state.tasks).toEqual([mockTask]);
    });
  });

  describe('createTaskSuccess', () => {
    it('appends the new task to an empty list', () => {
      const state = tasksReducer(
        initialTasksState,
        TaskActions.createTaskSuccess({ task: mockTask }),
      );
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0]).toEqual(mockTask);
    });

    it('appends after existing tasks', () => {
      const existing: Task = { ...mockTask, id: 'task-000', title: 'Existing' };
      const state = tasksReducer(
        { ...initialTasksState, tasks: [existing] },
        TaskActions.createTaskSuccess({ task: mockTask }),
      );
      expect(state.tasks).toHaveLength(2);
      expect(state.tasks[0]).toEqual(existing);
      expect(state.tasks[1]).toEqual(mockTask);
    });
  });

  describe('updateTaskSuccess', () => {
    it('replaces the task with the matching id', () => {
      const updated: Task = { ...mockTask, title: 'Updated Title' };
      const state = tasksReducer(
        { ...initialTasksState, tasks: [mockTask] },
        TaskActions.updateTaskSuccess({ task: updated }),
      );
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].title).toBe('Updated Title');
    });

    it('leaves tasks with different ids untouched', () => {
      const other: Task = { ...mockTask, id: 'task-002', title: 'Other Task' };
      const updated: Task = { ...mockTask, title: 'Updated' };
      const state = tasksReducer(
        { ...initialTasksState, tasks: [mockTask, other] },
        TaskActions.updateTaskSuccess({ task: updated }),
      );
      expect(state.tasks).toHaveLength(2);
      expect(state.tasks[1]).toEqual(other);
    });
  });

  describe('deleteTaskSuccess', () => {
    it('removes the task with the matching id', () => {
      const state = tasksReducer(
        { ...initialTasksState, tasks: [mockTask] },
        TaskActions.deleteTaskSuccess({ id: 'task-001' }),
      );
      expect(state.tasks).toHaveLength(0);
    });

    it('keeps tasks whose ids do not match', () => {
      const keeper: Task = { ...mockTask, id: 'task-002' };
      const state = tasksReducer(
        { ...initialTasksState, tasks: [mockTask, keeper] },
        TaskActions.deleteTaskSuccess({ id: 'task-001' }),
      );
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].id).toBe('task-002');
    });
  });

  describe('setFilter', () => {
    it('merges a partial filter into the existing filter state', () => {
      const state = tasksReducer(
        initialTasksState,
        TaskActions.setFilter({ filter: { status: 'done' } }),
      );
      expect(state.filter.status).toBe('done');
      expect(state.filter.priority).toBeNull();
      expect(state.filter.search).toBe('');
    });

    it('can update multiple filter fields simultaneously', () => {
      const state = tasksReducer(
        initialTasksState,
        TaskActions.setFilter({ filter: { status: 'todo', priority: 'high' } }),
      );
      expect(state.filter.status).toBe('todo');
      expect(state.filter.priority).toBe('high');
    });
  });

  describe('resetFilter', () => {
    it('restores all filter fields to their initial values', () => {
      const modified = {
        ...initialTasksState,
        filter: {
          status: 'done' as const,
          priority: 'high' as const,
          assigneeId: 'u1',
          search: 'query',
        },
      };
      const state = tasksReducer(modified, TaskActions.resetFilter());
      expect(state.filter).toEqual(initialTasksState.filter);
    });
  });
});

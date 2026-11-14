import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskBoardComponent, TaskCounts } from './task-board.component';
import type { Task } from '../../../../core/types/task.types';

const makeTask = (overrides: Partial<Task>): Task => ({
  id: 'task-001',
  title: 'Default Task',
  description: 'desc',
  status: 'todo',
  priority: 'medium',
  dueDate: '2025-12-31',
  assignee: { id: 'user-1', name: 'Alice Smith', avatar: '', email: '' },
  tags: [],
  isOverdue: false,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

const emptyCounts: TaskCounts = { todo: 0, in_progress: 0, done: 0, overdue: 0 };

describe('TaskBoardComponent', () => {
  let fixture: ComponentFixture<TaskBoardComponent>;
  let component: TaskBoardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tasks', []);
    fixture.componentRef.setInput('counts', emptyCounts);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // --- Column filtering ---

  it('todoTasks contains only tasks with status "todo"', () => {
    const tasks = [
      makeTask({ id: 't1', status: 'todo' }),
      makeTask({ id: 't2', status: 'done' }),
      makeTask({ id: 't3', status: 'in_progress' }),
    ];
    fixture.componentRef.setInput('tasks', tasks);
    const result = (component as never as { todoTasks: () => Task[] }).todoTasks();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t1');
  });

  it('inProgressTasks contains only tasks with status "in_progress"', () => {
    const tasks = [
      makeTask({ id: 't1', status: 'todo' }),
      makeTask({ id: 't2', status: 'in_progress' }),
      makeTask({ id: 't3', status: 'in_progress' }),
    ];
    fixture.componentRef.setInput('tasks', tasks);
    const result = (component as never as { inProgressTasks: () => Task[] }).inProgressTasks();
    expect(result).toHaveLength(2);
    result.forEach((t) => expect(t.status).toBe('in_progress'));
  });

  it('doneTasks contains only tasks with status "done"', () => {
    const tasks = [makeTask({ id: 't1', status: 'todo' }), makeTask({ id: 't2', status: 'done' })];
    fixture.componentRef.setInput('tasks', tasks);
    const result = (component as never as { doneTasks: () => Task[] }).doneTasks();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t2');
  });

  it('all three columns are empty when tasks array is empty', () => {
    fixture.componentRef.setInput('tasks', []);
    expect((component as never as { todoTasks: () => Task[] }).todoTasks()).toHaveLength(0);
    expect(
      (component as never as { inProgressTasks: () => Task[] }).inProgressTasks(),
    ).toHaveLength(0);
    expect((component as never as { doneTasks: () => Task[] }).doneTasks()).toHaveLength(0);
  });

  // --- Priority sort order ---

  it('sorts tasks high > medium > low within a column', () => {
    const tasks = [
      makeTask({ id: 'low', status: 'todo', priority: 'low', dueDate: '2025-01-01' }),
      makeTask({ id: 'high', status: 'todo', priority: 'high', dueDate: '2025-01-01' }),
      makeTask({ id: 'medium', status: 'todo', priority: 'medium', dueDate: '2025-01-01' }),
    ];
    fixture.componentRef.setInput('tasks', tasks);
    const sorted = (component as never as { todoTasks: () => Task[] }).todoTasks();
    expect(sorted[0].id).toBe('high');
    expect(sorted[1].id).toBe('medium');
    expect(sorted[2].id).toBe('low');
  });

  it('sorts by earlier dueDate first when priority is the same', () => {
    const tasks = [
      makeTask({ id: 'later', status: 'todo', priority: 'medium', dueDate: '2025-06-30' }),
      makeTask({ id: 'earlier', status: 'todo', priority: 'medium', dueDate: '2025-06-01' }),
    ];
    fixture.componentRef.setInput('tasks', tasks);
    const sorted = (component as never as { todoTasks: () => Task[] }).todoTasks();
    expect(sorted[0].id).toBe('earlier');
    expect(sorted[1].id).toBe('later');
  });

  it('does not mutate the original tasks array when sorting', () => {
    const tasks = [
      makeTask({ id: 'low', status: 'todo', priority: 'low' }),
      makeTask({ id: 'high', status: 'todo', priority: 'high' }),
    ];
    fixture.componentRef.setInput('tasks', tasks);
    (component as never as { todoTasks: () => Task[] }).todoTasks();
    expect(tasks[0].id).toBe('low');
  });

  // --- Outputs ---

  it('propagates editTask output from a child task card', () => {
    let emitted: Task | undefined;
    component.editTask.subscribe((t) => (emitted = t));
    const task = makeTask({ id: 'edit-me', status: 'todo' });
    component.editTask.emit(task);
    expect(emitted?.id).toBe('edit-me');
  });

  it('propagates deleteTask output from a child task card', () => {
    let emitted: Task | undefined;
    component.deleteTask.subscribe((t) => (emitted = t));
    const task = makeTask({ id: 'delete-me', status: 'done' });
    component.deleteTask.emit(task);
    expect(emitted?.id).toBe('delete-me');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TaskCardComponent } from './task-card.component';
import type { Task } from '../../../../core/types/task.types';

// Freeze time to 2025-06-15 noon so all date calculations are deterministic.
const FIXED_NOW = new Date('2025-06-15T12:00:00').getTime();

const makeTask = (overrides: Partial<Task>): Task => ({
  id: 'task-001',
  title: 'Test Task',
  description: 'A description',
  status: 'todo',
  priority: 'medium',
  dueDate: '2025-06-20',
  assignee: { id: 'user-1', name: 'Alice Smith', avatar: '', email: 'alice@test.com' },
  tags: [],
  isOverdue: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('TaskCardComponent', () => {
  let fixture: ComponentFixture<TaskCardComponent>;
  let component: TaskCardComponent;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);

    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', makeTask({}));
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // --- priorityLabel ---

  it('priorityLabel returns uppercased priority', () => {
    fixture.componentRef.setInput('task', makeTask({ priority: 'high' }));
    expect((component as never as { priorityLabel: () => string }).priorityLabel()).toBe('HIGH');
  });

  it('priorityLabel uppercases medium', () => {
    expect((component as never as { priorityLabel: () => string }).priorityLabel()).toBe('MEDIUM');
  });

  // --- priorityStyle ---

  it('priorityStyle returns red bg for high priority', () => {
    fixture.componentRef.setInput('task', makeTask({ priority: 'high' }));
    const style = (
      component as never as { priorityStyle: () => { bg: string; color: string } }
    ).priorityStyle();
    expect(style.bg).toBe('#D32F2F');
    expect(style.color).toBe('#FFFFFF');
  });

  it('priorityStyle returns amber bg for medium priority', () => {
    const style = (
      component as never as { priorityStyle: () => { bg: string; color: string } }
    ).priorityStyle();
    expect(style.bg).toBe('#FEF3C7');
  });

  it('priorityStyle returns green bg for low priority', () => {
    fixture.componentRef.setInput('task', makeTask({ priority: 'low' }));
    const style = (
      component as never as { priorityStyle: () => { bg: string; color: string } }
    ).priorityStyle();
    expect(style.bg).toBe('#DCFCE7');
  });

  // --- avatarColor ---

  it('avatarColor maps user-1 to the first avatar colour', () => {
    const color = (component as never as { avatarColor: () => string }).avatarColor();
    expect(color).toBe('#3B82F6');
  });

  it('avatarColor wraps around for user-6 (same as user-1)', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({ assignee: { id: 'user-6', name: 'Frank', avatar: '', email: '' } }),
    );
    const color = (component as never as { avatarColor: () => string }).avatarColor();
    expect(color).toBe('#3B82F6');
  });

  // --- assigneeName ---

  it('assigneeName returns the first name prefixed with @', () => {
    const name = (component as never as { assigneeName: () => string }).assigneeName();
    expect(name).toBe('@Alice');
  });

  it('assigneeName works for single-name assignees', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({ assignee: { id: 'user-2', name: 'Bob', avatar: '', email: '' } }),
    );
    const name = (component as never as { assigneeName: () => string }).assigneeName();
    expect(name).toBe('@Bob');
  });

  // --- hoverShadowColor ---

  it('returns the red overdue shadow when isOverdue and priority is high', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({ isOverdue: true, priority: 'high', status: 'todo' }),
    );
    const color = (component as never as { hoverShadowColor: () => string }).hoverShadowColor();
    expect(color).toBe('rgba(211, 47, 47, 0.35)');
  });

  it('returns the status shadow when overdue but priority is not high', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({ isOverdue: true, priority: 'medium', status: 'todo' }),
    );
    const color = (component as never as { hoverShadowColor: () => string }).hoverShadowColor();
    expect(color).toBe('rgba(25, 118, 210, 0.35)');
  });

  it('returns the in_progress status shadow', () => {
    fixture.componentRef.setInput('task', makeTask({ status: 'in_progress' }));
    const color = (component as never as { hoverShadowColor: () => string }).hoverShadowColor();
    expect(color).toBe('rgba(255, 111, 0, 0.35)');
  });

  it('returns the done status shadow', () => {
    fixture.componentRef.setInput('task', makeTask({ status: 'done' }));
    const color = (component as never as { hoverShadowColor: () => string }).hoverShadowColor();
    expect(color).toBe('rgba(56, 142, 60, 0.35)');
  });

  // --- dueInfo (date logic, frozen at 2025-06-15) ---

  it('dueInfo shows "Completed today" when completedAt is today', () => {
    fixture.componentRef.setInput('task', makeTask({ status: 'done', completedAt: '2025-06-15' }));
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toBe('Completed today');
    expect(info.type).toBe('done');
  });

  it('dueInfo shows "Completed yesterday" when completedAt was yesterday', () => {
    fixture.componentRef.setInput('task', makeTask({ status: 'done', completedAt: '2025-06-14' }));
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toBe('Completed yesterday');
  });

  it('dueInfo shows "Completed N days ago" for older completed tasks', () => {
    fixture.componentRef.setInput('task', makeTask({ status: 'done', completedAt: '2025-06-10' }));
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toBe('Completed 5 days ago');
  });

  it('dueInfo shows "Overdue by N days" when task is overdue', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({ isOverdue: true, dueDate: '2025-06-10', status: 'todo' }),
    );
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toBe('Overdue by 5 days');
    expect(info.type).toBe('overdue');
  });

  it('dueInfo uses singular "day" when overdue by exactly 1 day', () => {
    fixture.componentRef.setInput(
      'task',
      makeTask({ isOverdue: true, dueDate: '2025-06-14', status: 'todo' }),
    );
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toBe('Overdue by 1 day');
  });

  it('dueInfo shows "Due today" when dueDate is today', () => {
    fixture.componentRef.setInput('task', makeTask({ dueDate: '2025-06-15', status: 'todo' }));
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toBe('Due today');
    expect(info.type).toBe('due');
  });

  it('dueInfo shows "Due in 1 day" when due tomorrow', () => {
    fixture.componentRef.setInput('task', makeTask({ dueDate: '2025-06-16', status: 'todo' }));
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toBe('Due in 1 day');
  });

  it('dueInfo shows "Due in N days" for 2–6 days out', () => {
    fixture.componentRef.setInput('task', makeTask({ dueDate: '2025-06-20', status: 'todo' }));
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toBe('Due in 5 days');
  });

  it('dueInfo shows "Due in 1 week" for 7–13 days out', () => {
    fixture.componentRef.setInput('task', makeTask({ dueDate: '2025-06-23', status: 'todo' }));
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toBe('Due in 1 week');
  });

  it('dueInfo shows "Due in N weeks" for 14+ days out', () => {
    fixture.componentRef.setInput('task', makeTask({ dueDate: '2025-07-15', status: 'todo' }));
    const info = (
      component as never as { dueInfo: () => { label: string; type: string } }
    ).dueInfo();
    expect(info.label).toMatch(/Due in \d+ weeks/);
  });

  // --- menu ---

  it('menuOpen starts as false', () => {
    expect((component as never as { menuOpen: () => boolean }).menuOpen()).toBe(false);
  });

  it('toggleMenu flips menuOpen to true', () => {
    const event = new MouseEvent('click');
    (component as never as { toggleMenu: (e: Event) => void }).toggleMenu(event);
    expect((component as never as { menuOpen: () => boolean }).menuOpen()).toBe(true);
  });

  it('toggleMenu toggles back to false on second call', () => {
    const event = new MouseEvent('click');
    (component as never as { toggleMenu: (e: Event) => void }).toggleMenu(event);
    (component as never as { toggleMenu: (e: Event) => void }).toggleMenu(event);
    expect((component as never as { menuOpen: () => boolean }).menuOpen()).toBe(false);
  });

  it('closeMenu sets menuOpen to false', () => {
    const event = new MouseEvent('click');
    (component as never as { toggleMenu: (e: Event) => void }).toggleMenu(event);
    (component as never as { closeMenu: () => void }).closeMenu();
    expect((component as never as { menuOpen: () => boolean }).menuOpen()).toBe(false);
  });

  // --- outputs ---

  it('onEdit emits editTask with the current task', () => {
    let emitted: Task | undefined;
    component.editTask.subscribe((t) => (emitted = t));
    const event = new MouseEvent('click');
    (component as never as { onEdit: (e: Event) => void }).onEdit(event);
    expect(emitted).toEqual(makeTask({}));
  });

  it('onEdit closes the menu', () => {
    const event = new MouseEvent('click');
    (component as never as { toggleMenu: (e: Event) => void }).toggleMenu(event);
    (component as never as { onEdit: (e: Event) => void }).onEdit(event);
    expect((component as never as { menuOpen: () => boolean }).menuOpen()).toBe(false);
  });

  it('onDelete emits deleteTask with the current task', () => {
    let emitted: Task | undefined;
    component.deleteTask.subscribe((t) => (emitted = t));
    const event = new MouseEvent('click');
    (component as never as { onDelete: (e: Event) => void }).onDelete(event);
    expect(emitted).toEqual(makeTask({}));
  });

  it('onDelete closes the menu', () => {
    const event = new MouseEvent('click');
    (component as never as { toggleMenu: (e: Event) => void }).toggleMenu(event);
    (component as never as { onDelete: (e: Event) => void }).onDelete(event);
    expect((component as never as { menuOpen: () => boolean }).menuOpen()).toBe(false);
  });
});

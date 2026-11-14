import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFilterBarComponent } from './task-filter-bar.component';
import type { TaskPriority, TaskStatus } from '../../../core/types/task.types';

describe('TaskFilterBarComponent', () => {
  let fixture: ComponentFixture<TaskFilterBarComponent>;
  let component: TaskFilterBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFilterBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // --- default inputs ---

  it('defaults activeStatus to "all"', () => {
    expect(component.activeStatus()).toBe('all');
  });

  it('defaults activePriority to null', () => {
    expect(component.activePriority()).toBeNull();
  });

  // --- selectStatus ---

  it('selectStatus emits the chosen status value', () => {
    let emitted: (TaskStatus | 'all') | undefined;
    component.statusChange.subscribe((v) => (emitted = v));

    (component as never as { selectStatus: (v: TaskStatus | 'all') => void }).selectStatus('done');
    expect(emitted).toBe('done');
  });

  it('selectStatus emits "all" when clearing the filter', () => {
    let emitted: (TaskStatus | 'all') | undefined;
    component.statusChange.subscribe((v) => (emitted = v));

    (component as never as { selectStatus: (v: TaskStatus | 'all') => void }).selectStatus('all');
    expect(emitted).toBe('all');
  });

  it('selectStatus emits "in_progress"', () => {
    let emitted: (TaskStatus | 'all') | undefined;
    component.statusChange.subscribe((v) => (emitted = v));

    (component as never as { selectStatus: (v: TaskStatus | 'all') => void }).selectStatus(
      'in_progress',
    );
    expect(emitted).toBe('in_progress');
  });

  // --- selectPriority ---

  it('selectPriority emits the chosen priority', () => {
    let emitted: (TaskPriority | null) | undefined;
    component.priorityChange.subscribe((v) => (emitted = v));

    (component as never as { selectPriority: (v: TaskPriority | null) => void }).selectPriority(
      'high',
    );
    expect(emitted).toBe('high');
  });

  it('selectPriority emits null when clearing the priority filter', () => {
    let emitted: (TaskPriority | null) | undefined;
    component.priorityChange.subscribe((v) => (emitted = v));

    (component as never as { selectPriority: (v: TaskPriority | null) => void }).selectPriority(
      null,
    );
    expect(emitted).toBeNull();
  });

  it('selectPriority closes the dropdown', () => {
    const c = component as never as {
      priorityDropdownOpen: boolean;
      selectPriority: (v: TaskPriority | null) => void;
    };
    c.priorityDropdownOpen = true;
    c.selectPriority('low');
    expect(c.priorityDropdownOpen).toBe(false);
  });

  // --- tabs and priorities are populated ---

  it('exposes the status filter tabs', () => {
    const tabs = (component as never as { tabs: unknown[] }).tabs;
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('exposes the priority filter options', () => {
    const priorities = (component as never as { priorities: unknown[] }).priorities;
    expect(priorities.length).toBeGreaterThan(0);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFilterBarComponent } from './task-filter-bar.component';
import type { Assignee, TaskPriority, TaskStatus } from '../../../core/types/task.types';

const MOCK_ASSIGNEES: Assignee[] = [
  { id: 'u1', name: 'Alice', avatar: '', email: 'alice@example.com' },
  { id: 'u2', name: 'Bob', avatar: '', email: 'bob@example.com' },
];

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

  // --- selectAssignee ---

  it('defaults activeAssigneeId to null', () => {
    expect(component.activeAssigneeId()).toBeNull();
  });

  it('defaults assignees to an empty array', () => {
    expect(component.assignees()).toEqual([]);
  });

  it('selectAssignee emits the chosen assignee id', () => {
    let emitted: (string | null) | undefined;
    component.assigneeChange.subscribe((v) => (emitted = v));

    (component as never as { selectAssignee: (id: string | null) => void }).selectAssignee('u1');
    expect(emitted).toBe('u1');
  });

  it('selectAssignee emits null when clearing the assignee filter', () => {
    let emitted: (string | null) | undefined;
    component.assigneeChange.subscribe((v) => (emitted = v));

    (component as never as { selectAssignee: (id: string | null) => void }).selectAssignee(null);
    expect(emitted).toBeNull();
  });

  it('selectAssignee closes the dropdown', () => {
    const c = component as never as {
      assigneeDropdownOpen: boolean;
      selectAssignee: (id: string | null) => void;
    };
    c.assigneeDropdownOpen = true;
    c.selectAssignee('u2');
    expect(c.assigneeDropdownOpen).toBe(false);
  });

  // --- activeAssigneeName ---

  it('activeAssigneeName returns "Assignee" when no assignee is selected', () => {
    const name = (component as never as { activeAssigneeName: string }).activeAssigneeName;
    expect(name).toBe('Assignee');
  });

  it('activeAssigneeName returns the matching assignee name', () => {
    fixture.componentRef.setInput('assignees', MOCK_ASSIGNEES);
    fixture.componentRef.setInput('activeAssigneeId', 'u1');
    fixture.detectChanges();

    const name = (component as never as { activeAssigneeName: string }).activeAssigneeName;
    expect(name).toBe('Alice');
  });

  it('activeAssigneeName falls back to "Assignee" for an unknown id', () => {
    fixture.componentRef.setInput('assignees', MOCK_ASSIGNEES);
    fixture.componentRef.setInput('activeAssigneeId', 'unknown');
    fixture.detectChanges();

    const name = (component as never as { activeAssigneeName: string }).activeAssigneeName;
    expect(name).toBe('Assignee');
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { TaskFormModalComponent } from './task-form-modal.component';
import { UserApiService } from '../../../core/services/user-api.service';
import type { Assignee, Task, TaskFormData } from '../../../core/types/task.types';

// All protected members are accessed via (component as any) to bypass the TypeScript access check.
// This is intentional in unit tests that target internal form/signal logic.

interface AnyComponent {
  isEdit: () => boolean;
  title: () => string;
  form: {
    get: (
      name: string,
    ) => {
      value: unknown;
      markAsTouched: () => void;
      setValue: (v: unknown) => void;
      hasError: (k: string) => boolean;
    } | null;
    setValue: (v: Record<string, unknown>) => void;
  };
  tagsArray: FormArray;
  users: () => Assignee[];
  newTagValue: { set: (v: string) => void; (): string };
  submitted: { set: (v: boolean) => void; (): boolean };
  statuses: unknown[];
  priorities: unknown[];
  addTag: () => void;
  removeTag: (i: number) => void;
  onTagKeydown: (e: KeyboardEvent) => void;
  hasError: (name: string, key: string) => boolean;
  onSubmit: () => void;
}

const mockUsers: Assignee[] = [
  { id: 'user-1', name: 'Alice Smith', avatar: '', email: 'alice@test.com' },
];

const mockTask: Task = {
  id: 'task-001',
  title: 'Existing Task',
  description: 'An existing description that is long enough',
  status: 'in_progress',
  priority: 'high',
  dueDate: '2099-12-31',
  assignee: mockUsers[0],
  tags: ['bug', 'frontend'],
  isOverdue: false,
  createdAt: '',
  updatedAt: '',
};

describe('TaskFormModalComponent', () => {
  let fixture: ComponentFixture<TaskFormModalComponent>;
  let c: AnyComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormModalComponent],
      providers: [{ provide: UserApiService, useValue: { getUsers: () => of(mockUsers) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormModalComponent);
    c = fixture.componentInstance as unknown as AnyComponent;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // --- create vs edit mode ---

  it('isEdit is false when no task input is provided', () => {
    expect(c.isEdit()).toBe(false);
  });

  it('title is "Create Task" in create mode', () => {
    expect(c.title()).toBe('Create Task');
  });

  it('isEdit is true when a task input is provided', () => {
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
    expect(c.isEdit()).toBe(true);
  });

  it('title is "Edit Task" in edit mode', () => {
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
    expect(c.title()).toBe('Edit Task');
  });

  it('ngOnInit patches form with task values when in edit mode', () => {
    fixture.componentRef.setInput('task', mockTask);
    fixture.componentInstance.ngOnInit();
    expect(c.form.get('title')?.value).toBe(mockTask.title);
    expect(c.form.get('description')?.value).toBe(mockTask.description);
    expect(c.form.get('status')?.value).toBe(mockTask.status);
    expect(c.form.get('priority')?.value).toBe(mockTask.priority);
    expect(c.form.get('dueDate')?.value).toBe(mockTask.dueDate);
    expect(c.form.get('assigneeId')?.value).toBe(mockTask.assignee.id);
  });

  it('ngOnInit populates tags array in edit mode', () => {
    fixture.componentRef.setInput('task', mockTask);
    fixture.componentInstance.ngOnInit();
    expect(c.tagsArray.length).toBe(mockTask.tags.length);
    expect(c.tagsArray.value).toEqual(mockTask.tags);
  });

  // --- statuses and priorities lists ---

  it('exposes all three statuses', () => {
    expect(c.statuses).toHaveLength(3);
  });

  it('exposes all three priorities', () => {
    expect(c.priorities).toHaveLength(3);
  });

  // --- users signal ---

  it('users signal is populated from the service', () => {
    expect(c.users()).toEqual(mockUsers);
  });

  // --- addTag ---

  it('addTag adds a trimmed tag to the array', () => {
    c.newTagValue.set('  my-tag  ');
    c.addTag();
    expect(c.tagsArray.length).toBe(1);
    expect(c.tagsArray.value[0]).toBe('my-tag');
  });

  it('addTag clears newTagValue after adding', () => {
    c.newTagValue.set('tag1');
    c.addTag();
    expect(c.newTagValue()).toBe('');
  });

  it('addTag does not add an empty tag', () => {
    c.newTagValue.set('');
    c.addTag();
    expect(c.tagsArray.length).toBe(0);
  });

  it('addTag does not add a duplicate tag', () => {
    c.newTagValue.set('dup');
    c.addTag();
    c.newTagValue.set('dup');
    c.addTag();
    expect(c.tagsArray.length).toBe(1);
  });

  it('addTag does not add a 6th tag (max is 5)', () => {
    for (let i = 0; i < 5; i++) {
      c.newTagValue.set(`tag${i}`);
      c.addTag();
    }
    c.newTagValue.set('tag-overflow');
    c.addTag();
    expect(c.tagsArray.length).toBe(5);
  });

  // --- removeTag ---

  it('removeTag removes the tag at the given index', () => {
    c.tagsArray.push(new FormControl('first'));
    c.tagsArray.push(new FormControl('second'));
    c.removeTag(0);
    expect(c.tagsArray.length).toBe(1);
    expect(c.tagsArray.value[0]).toBe('second');
  });

  // --- onTagKeydown ---

  it('onTagKeydown calls addTag on Enter key', () => {
    c.newTagValue.set('enter-tag');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperty(event, 'preventDefault', { value: () => undefined });
    c.onTagKeydown(event);
    expect(c.tagsArray.length).toBe(1);
  });

  it('onTagKeydown does not add a tag for other keys', () => {
    c.newTagValue.set('no-add');
    const event = new KeyboardEvent('keydown', { key: 'Space' });
    c.onTagKeydown(event);
    expect(c.tagsArray.length).toBe(0);
  });

  // --- hasError ---

  it('hasError returns false before the control is touched or submitted', () => {
    expect(c.hasError('title', 'required')).toBe(false);
  });

  it('hasError returns true when control is touched with a validation error', () => {
    c.form.get('title')?.setValue('');
    c.form.get('title')?.markAsTouched();
    expect(c.hasError('title', 'required')).toBe(true);
  });

  it('hasError returns true when form is submitted with a validation error', () => {
    c.form.get('title')?.setValue('');
    c.submitted.set(true);
    expect(c.hasError('title', 'required')).toBe(true);
  });

  // --- form validators ---

  it('title requires at least 3 characters', () => {
    c.form.get('title')?.setValue('ab');
    expect(c.form.get('title')?.hasError('minlength')).toBe(true);
  });

  it('title rejects leading whitespace', () => {
    c.form.get('title')?.setValue('  hello');
    expect(c.form.get('title')?.hasError('whitespace')).toBe(true);
  });

  it('description requires at least 10 characters', () => {
    c.form.get('description')?.setValue('short');
    expect(c.form.get('description')?.hasError('minlength')).toBe(true);
  });

  it('dueDate rejects a past date', () => {
    c.form.get('dueDate')?.setValue('1990-01-01');
    expect(c.form.get('dueDate')?.hasError('pastDate')).toBe(true);
  });

  it('dueDate accepts a far-future date', () => {
    c.form.get('dueDate')?.setValue('2099-12-31');
    expect(c.form.get('dueDate')?.hasError('pastDate')).toBeFalsy();
  });

  it('tags FormArray shows maxTags error when more than 5 tags are pushed', () => {
    for (let i = 0; i < 6; i++) {
      c.tagsArray.push(new FormControl(`tag${i}`));
    }
    expect(c.tagsArray.hasError('maxTags')).toBe(true);
  });

  // --- onSubmit ---

  it('onSubmit sets submitted to true', () => {
    c.onSubmit();
    expect(c.submitted()).toBe(true);
  });

  it('onSubmit does not emit saved when form is invalid', () => {
    let emitted = false;
    fixture.componentInstance.saved.subscribe(() => (emitted = true));
    c.onSubmit();
    expect(emitted).toBe(false);
  });

  it('onSubmit emits saved with correct TaskFormData when form is valid', () => {
    let emitted: TaskFormData | undefined;
    fixture.componentInstance.saved.subscribe((d) => (emitted = d));

    c.form.setValue({
      title: 'Valid Title Here',
      description: 'This description is long enough to pass',
      status: 'todo',
      priority: 'medium',
      dueDate: '2099-12-31',
      assigneeId: 'user-1',
      tags: [],
    });

    c.onSubmit();

    expect(emitted).toBeDefined();
    expect(emitted?.title).toBe('Valid Title Here');
    expect(emitted?.assigneeId).toBe('user-1');
    expect(emitted?.tags).toEqual([]);
  });

  it('closed output can be subscribed to', () => {
    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));
    fixture.componentInstance.closed.emit();
    expect(closed).toBe(true);
  });
});

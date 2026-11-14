import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { UserApiService } from '../../../core/services/user-api.service';
import {
  Assignee,
  Task,
  TaskFormData,
  TaskPriority,
  TaskStatus,
} from '../../../core/types/task.types';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../../core/types/constants';

// --- Custom Validators ---

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(control.value + 'T00:00:00');
  return selected < today ? { pastDate: true } : null;
}

function noLeadingTrailingWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return control.value !== control.value.trim() ? { whitespace: true } : null;
}

function maxTagsValidator(max: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    return arr.length > max ? { maxTags: { max, actual: arr.length } } : null;
  };
}

@Component({
  selector: 'app-task-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form-modal.component.html',
  styleUrl: './task-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userApiService = inject(UserApiService);

  readonly task = input<Task | null>(null);
  readonly saved = output<TaskFormData>();
  readonly closed = output<void>();

  protected readonly isEdit = computed(() => !!this.task());
  protected readonly title = computed(() => (this.isEdit() ? 'Edit Task' : 'Create Task'));

  protected readonly statuses: { label: string; value: TaskStatus }[] = Object.entries(
    TASK_STATUS_LABELS,
  ).map(([value, label]) => ({ value: value as TaskStatus, label }));

  protected readonly priorities: { label: string; value: TaskPriority }[] = Object.entries(
    TASK_PRIORITY_LABELS,
  ).map(([value, label]) => ({ value: value as TaskPriority, label }));

  protected readonly users = toSignal(this.userApiService.getUsers(), {
    initialValue: [] as Assignee[],
  });

  protected readonly newTagValue = signal('');
  protected readonly submitted = signal(false);

  protected form = this.fb.group({
    title: [
      '',
      [Validators.required, Validators.minLength(3), noLeadingTrailingWhitespaceValidator],
    ],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: ['todo' as TaskStatus, Validators.required],
    priority: ['medium' as TaskPriority, Validators.required],
    dueDate: ['', [Validators.required, futureDateValidator]],
    assigneeId: ['', Validators.required],
    tags: this.fb.array<string>([], maxTagsValidator(5)),
  });

  get tagsArray(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  public ngOnInit(): void {
    const task = this.task();
    if (task) {
      this.form.patchValue({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeId: task.assignee.id,
      });
      task.tags.forEach((tag) => this.tagsArray.push(this.fb.control(tag)));
    }
  }

  protected addTag(): void {
    const tag = this.newTagValue().trim();
    if (!tag || this.tagsArray.length >= 5) return;
    if ((this.tagsArray.value as string[]).includes(tag)) return;
    this.tagsArray.push(this.fb.control(tag));
    this.newTagValue.set('');
  }

  protected removeTag(index: number): void {
    this.tagsArray.removeAt(index);
  }

  protected onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  protected hasError(controlName: string, errorKey: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.hasError(errorKey) && (control.touched || this.submitted()));
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const formData: TaskFormData = {
      title: raw.title!,
      description: raw.description!,
      status: raw.status!,
      priority: raw.priority!,
      dueDate: raw.dueDate!,
      assigneeId: raw.assigneeId!,
      tags: (raw.tags as string[]) ?? [],
    };
    this.saved.emit(formData);
  }
}

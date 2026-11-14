import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Assignee, TaskPriority, TaskStatus } from '../../../core/types/task.types';
import { PriorityLabelPipe } from '../pipes/priority-label.pipe';

type StatusFilter = TaskStatus | 'all';

@Component({
  selector: 'app-task-filter-bar',
  imports: [PriorityLabelPipe],
  templateUrl: './task-filter-bar.component.html',
  styleUrl: './task-filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFilterBarComponent {
  readonly activeStatus = input<StatusFilter>('all');
  readonly activePriority = input<TaskPriority | null>(null);
  readonly activeAssigneeId = input<string | null>(null);
  readonly assignees = input<Assignee[]>([]);

  readonly statusChange = output<StatusFilter>();
  readonly priorityChange = output<TaskPriority | null>();
  readonly assigneeChange = output<string | null>();
  readonly newTask = output<void>();

  protected readonly localTabs = [
    { label: $localize`:filter tab|all@@filter.status.all:All`, value: 'all' as const },
    { label: $localize`:task status|todo@@status.todo:To Do`, value: 'todo' as TaskStatus },
    {
      label: $localize`:task status|in progress@@status.in-progress:In Progress`,
      value: 'in_progress' as TaskStatus,
    },
    { label: $localize`:task status|done@@status.done:Done`, value: 'done' as TaskStatus },
  ];

  protected readonly localPriorities = [
    {
      label: $localize`:filter option|all@@filter.priority.all:All`,
      value: null as TaskPriority | null,
    },
    { label: $localize`:task priority|high@@priority.high:High`, value: 'high' as TaskPriority },
    {
      label: $localize`:task priority|medium@@priority.medium:Medium`,
      value: 'medium' as TaskPriority,
    },
    { label: $localize`:task priority|low@@priority.low:Low`, value: 'low' as TaskPriority },
  ];

  protected priorityDropdownOpen = false;
  protected assigneeDropdownOpen = false;

  protected selectStatus(value: StatusFilter): void {
    this.statusChange.emit(value);
  }

  protected selectPriority(value: TaskPriority | null): void {
    this.priorityChange.emit(value);
    this.priorityDropdownOpen = false;
  }

  protected selectAssignee(id: string | null): void {
    this.assigneeChange.emit(id);
    this.assigneeDropdownOpen = false;
  }

  protected get activeAssigneeName(): string {
    const id = this.activeAssigneeId();
    const defaultLabel = $localize`:filter bar|default assignee filter label@@filter.assignee.default:Assignee`;
    if (!id) return defaultLabel;
    return this.assignees().find((a) => a.id === id)?.name ?? defaultLabel;
  }
}

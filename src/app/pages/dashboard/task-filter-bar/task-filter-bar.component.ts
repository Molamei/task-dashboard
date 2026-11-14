import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TaskPriority, TaskStatus } from '../../../core/types/task.types';
import { PRIORITY_FILTER_OPTIONS, STATUS_FILTER_TABS } from '../../../core/types/constants';
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

  readonly statusChange = output<StatusFilter>();
  readonly priorityChange = output<TaskPriority | null>();
  readonly newTask = output<void>();

  protected readonly tabs = STATUS_FILTER_TABS;
  protected readonly priorities = PRIORITY_FILTER_OPTIONS;

  protected priorityDropdownOpen = false;

  protected selectStatus(value: StatusFilter): void {
    this.statusChange.emit(value);
  }

  protected selectPriority(value: TaskPriority | null): void {
    this.priorityChange.emit(value);
    this.priorityDropdownOpen = false;
  }
}

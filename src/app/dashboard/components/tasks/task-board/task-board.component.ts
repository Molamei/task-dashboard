import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Task } from '../../../../core/types/task.types';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TASK_STATUS_LABELS } from '../../../../core/types/constants';

export interface TaskCounts {
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
}

@Component({
  selector: 'app-task-board',
  imports: [TaskCardComponent],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskBoardComponent {
  readonly tasks = input.required<Task[]>();
  readonly counts = input.required<TaskCounts>();

  protected readonly statusLabels = TASK_STATUS_LABELS;

  protected readonly todoTasks = computed(() => this.tasks().filter((t) => t.status === 'todo'));

  protected readonly inProgressTasks = computed(() =>
    this.tasks().filter((t) => t.status === 'in_progress'),
  );

  protected readonly doneTasks = computed(() => this.tasks().filter((t) => t.status === 'done'));
}

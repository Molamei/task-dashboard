import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
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
  readonly loading = input<boolean>(false);

  readonly editTask = output<Task>();
  readonly deleteTask = output<Task>();

  protected readonly statusLabels = TASK_STATUS_LABELS;

  private readonly priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  private sortByPriority(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      const priorityDiff = this.priorityOrder[a.priority] - this.priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  protected readonly todoTasks = computed(() =>
    this.sortByPriority(this.tasks().filter((t) => t.status === 'todo')),
  );

  protected readonly inProgressTasks = computed(() =>
    this.sortByPriority(this.tasks().filter((t) => t.status === 'in_progress')),
  );

  protected readonly doneTasks = computed(() =>
    this.sortByPriority(this.tasks().filter((t) => t.status === 'done')),
  );
}

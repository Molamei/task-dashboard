import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Task } from '../../../../core/types/task.types';
import { TaskCardComponent } from '../task-card/task-card.component';

/**
 * Aggregated task counts per status column plus a cross-cutting overdue count.
 * Provided by `selectTaskCountByStatus` and passed into the board as an input.
 */
export interface TaskCounts {
  todo: number;
  in_progress: number;
  done: number;
  /** May overlap with `todo` / `in_progress` — based on the `isOverdue` flag. */
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

  protected readonly localStatusLabels: Record<string, string> = {
    todo: $localize`:task status|todo@@status.todo:To Do`,
    in_progress: $localize`:task status|in progress@@status.in-progress:In Progress`,
    done: $localize`:task status|done@@status.done:Done`,
  };

  private readonly priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  /**
   * Sorts a task array by priority (high → medium → low), using due date as a
   * tiebreaker so that equal-priority tasks appear in ascending deadline order.
   * Returns a new array; the original is not mutated.
   *
   * @param tasks - Tasks to sort (any status subset).
   * @returns A new sorted array.
   */
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

import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  AVATAR_COLORS,
  TASK_PRIORITY_BADGE,
  TASK_STATUS_SHADOW,
} from '../../../../core/types/constants';
import { Task } from '../../../../core/types/task.types';

@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  readonly task = input.required<Task>();
  readonly editTask = output<Task>();
  readonly deleteTask = output<Task>();

  protected readonly menuOpen = signal(false);

  protected readonly priorityStyle = computed(() => TASK_PRIORITY_BADGE[this.task().priority]);
  protected readonly priorityLabel = computed(() => {
    switch (this.task().priority) {
      case 'high':
        return $localize`:task priority|high@@priority.high:High`;
      case 'medium':
        return $localize`:task priority|medium@@priority.medium:Medium`;
      case 'low':
        return $localize`:task priority|low@@priority.low:Low`;
      default:
        return this.task().priority.toUpperCase();
    }
  });

  /**
   * Deterministically maps an assignee ID to a colour from `AVATAR_COLORS`.
   * Strips non-digits from the ID string, converts to a number, then wraps
   * around the palette using modulo so every assignee always gets the same colour.
   */
  protected readonly avatarColor = computed(() => {
    const num = parseInt(this.task().assignee.id.replace(/\D/g, ''), 10);
    return AVATAR_COLORS[(num - 1) % AVATAR_COLORS.length];
  });

  protected readonly assigneeName = computed(() => {
    return '@' + this.task().assignee.name.split(' ')[0];
  });

  /**
   * Resolves the CSS `box-shadow` colour for the card's hover state.
   * High-priority overdue tasks receive a red shadow to visually escalate
   * urgency; all other cards use the status-based shadow from `STATUS_SHADOW`.
   */
  protected readonly hoverShadowColor = computed(() => {
    const task = this.task();
    if (task.isOverdue && task.priority === 'high') return 'rgba(211, 47, 47, 0.35)';
    return TASK_STATUS_SHADOW[task.status];
  });

  /**
   * Computes a human-readable due-date label and a semantic `type` token for
   * template styling. Evaluated branches in priority order:
   *
   * 1. **Completed** — task is `done` and has a `completedAt` timestamp.
   *    Returns "Completed today / yesterday / N days ago".
   * 2. **Overdue** — `isOverdue` flag is set (server-computed).
   *    Returns "Overdue by N day(s)"; minimum of 1 day is enforced.
   * 3. **Upcoming** — task is not yet due.
   *    Returns "Due today / in 1 day / in N days / in 1 week / in N weeks".
   *
   * All date arithmetic is performed against midnight local time to avoid
   * fractional-day artefacts caused by time components.
   */
  protected readonly dueInfo = computed(() => {
    const task = this.task();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (task.status === 'done' && task.completedAt) {
      const completed = new Date(task.completedAt);
      completed.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - completed.getTime()) / 86_400_000);
      if (diff === 0) return { label: 'Completed today', type: 'done' as const };
      if (diff === 1) return { label: 'Completed yesterday', type: 'done' as const };
      return { label: `Completed ${diff} days ago`, type: 'done' as const };
    }

    if (task.isOverdue) {
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - due.getTime()) / 86_400_000);
      const days = Math.max(diff, 1);
      return { label: `Overdue by ${days} day${days !== 1 ? 's' : ''}`, type: 'overdue' as const };
    }

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);

    if (diff <= 0) return { label: 'Due today', type: 'due' as const };
    if (diff === 1) return { label: 'Due in 1 day', type: 'due' as const };
    if (diff < 7) return { label: `Due in ${diff} days`, type: 'due' as const };
    if (diff < 14) return { label: 'Due in 1 week', type: 'due' as const };
    return { label: `Due in ${Math.floor(diff / 7)} weeks`, type: 'due' as const };
  });

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  protected onEdit(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.editTask.emit(this.task());
  }

  protected onDelete(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.deleteTask.emit(this.task());
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}

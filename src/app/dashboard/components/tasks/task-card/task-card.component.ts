import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../../../../core/types/task.types';

const AVATAR_COLORS = ['#3B82F6', '#22C55E', '#F97316', '#8B5CF6', '#06B6D4'];

const STATUS_SHADOW: Record<TaskStatus, string> = {
  todo: 'rgba(25, 118, 210, 0.35)',
  in_progress: 'rgba(255, 111, 0, 0.35)',
  done: 'rgba(56, 142, 60, 0.35)',
};

const PRIORITY_CONFIG: Record<TaskPriority, { bg: string; color: string }> = {
  high: { bg: '#D32F2F', color: '#FFFFFF' },
  medium: { bg: '#FEF3C7', color: '#D97706' },
  low: { bg: '#DCFCE7', color: '#16A34A' },
};

@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  readonly task = input.required<Task>();

  protected readonly priorityStyle = computed(() => PRIORITY_CONFIG[this.task().priority]);

  protected readonly priorityLabel = computed(() => this.task().priority.toUpperCase());

  protected readonly avatarColor = computed(() => {
    const num = parseInt(this.task().assignee.id.replace(/\D/g, ''), 10);
    return AVATAR_COLORS[(num - 1) % AVATAR_COLORS.length];
  });

  protected readonly assigneeName = computed(() => {
    return '@' + this.task().assignee.name.split(' ')[0];
  });

  protected readonly hoverShadowColor = computed(() => {
    const task = this.task();
    if (task.isOverdue && task.priority === 'high') return 'rgba(211, 47, 47, 0.35)';
    return STATUS_SHADOW[task.status];
  });

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
}

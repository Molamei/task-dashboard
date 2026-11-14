import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { TaskModalService } from '../../core/services/task-modal.service';
import { Store } from '@ngrx/store';
import { StatisticsActions } from '../../core/store/statistics/statistics.actions';
import {
  selectAllStatistics,
  selectStatisticsLoading,
} from '../../core/store/statistics/statistics.selectors';
import { ActivityActions } from '../../core/store/activity/activity.actions';
import { selectRecentActivityEvents } from '../../core/store/activity/activity.selectors';
import { TaskActions } from '../../core/store/tasks/tasks.actions';
import {
  selectFilteredTasks,
  selectAllTasks,
  selectTaskCountByStatus,
  selectTasksLoading,
} from '../../core/store/tasks/tasks.selectors';
import { Task, TaskFormData, TaskPriority, TaskStatus } from '../../core/types/task.types';
import { StatCardComponent } from './stat-card/stat-card.component';
import { TaskFilterBarComponent } from './task-filter-bar/task-filter-bar.component';
import { TaskBoardComponent } from './tasks/task-board/task-board.component';
import { TaskFormModalComponent } from './task-form-modal/task-form-modal.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ActivityFeedComponent } from './activity-feed/activity-feed.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

type StatusFilter = TaskStatus | 'all';
type ModalMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-dashboard',
  imports: [
    AsyncPipe,
    StatCardComponent,
    TaskFilterBarComponent,
    TaskBoardComponent,
    TaskFormModalComponent,
    AnalyticsComponent,
    ActivityFeedComponent,
    ConfirmDialogComponent,
    SkeletonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly taskModal = inject(TaskModalService);

  constructor() {
    effect(() => {
      if (this.taskModal.pendingOpen()) {
        this.onNewTask();
        this.taskModal.consume();
      }
    });
  }

  protected readonly statistics$ = this.store.select(selectAllStatistics);
  protected readonly statisticsLoading$ = this.store.select(selectStatisticsLoading);
  protected readonly filteredTasks$ = this.store.select(selectFilteredTasks);
  protected readonly allTasks$ = this.store.select(selectAllTasks);
  protected readonly taskCounts$ = this.store.select(selectTaskCountByStatus);
  protected readonly tasksLoading$ = this.store.select(selectTasksLoading);
  protected readonly activityEvents$ = this.store.select(selectRecentActivityEvents);

  protected readonly activeStatus = signal<StatusFilter>('all');
  protected readonly activePriority = signal<TaskPriority | null>(null);

  protected readonly modalMode = signal<ModalMode>(null);
  protected readonly taskToEdit = signal<Task | null>(null);
  protected readonly taskToDelete = signal<Task | null>(null);

  public ngOnInit(): void {
    this.store.dispatch(StatisticsActions.loadStatistics());
    this.store.dispatch(TaskActions.loadTasks());
  }

  protected onStatusChange(status: StatusFilter): void {
    this.activeStatus.set(status);
    this.store.dispatch(
      TaskActions.setFilter({ filter: { status: status === 'all' ? null : status } }),
    );
  }

  protected onPriorityChange(priority: TaskPriority | null): void {
    this.activePriority.set(priority);
    this.store.dispatch(TaskActions.setFilter({ filter: { priority } }));
  }

  protected onNewTask(): void {
    this.taskToEdit.set(null);
    this.modalMode.set('create');
  }

  protected onEditTask(task: Task): void {
    this.taskToEdit.set(task);
    this.modalMode.set('edit');
  }

  protected onDeleteTask(task: Task): void {
    this.taskToDelete.set(task);
  }

  protected onModalSave(formData: TaskFormData): void {
    const mode = this.modalMode();
    if (mode === 'create') {
      this.store.dispatch(TaskActions.createTask({ formData }));
    } else if (mode === 'edit') {
      const existing = this.taskToEdit();
      if (existing) {
        this.store.dispatch(TaskActions.updateTask({ id: existing.id, existing, formData }));
      }
    }
    this.closeModal();
  }

  protected closeModal(): void {
    this.modalMode.set(null);
    this.taskToEdit.set(null);
  }

  protected onConfirmDelete(): void {
    const task = this.taskToDelete();
    if (task) {
      this.store.dispatch(TaskActions.deleteTask({ id: task.id }));
    }
    this.taskToDelete.set(null);
  }

  protected onCancelDelete(): void {
    this.taskToDelete.set(null);
  }

  protected onClearActivity(): void {
    this.store.dispatch(ActivityActions.clearEvents());
  }
}

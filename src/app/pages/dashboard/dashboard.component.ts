import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { StatisticsActions } from '../../core/store/statistics/statistics.actions';
import { selectAllStatistics } from '../../core/store/statistics/statistics.selectors';
import { StatCardComponent } from '../../dashboard/components/stat-card/stat-card.component';
import { TaskFilterBarComponent } from '../../dashboard/components/task-filter-bar/task-filter-bar.component';
import { TaskBoardComponent } from '../../dashboard/components/tasks/task-board/task-board.component';
import { AsyncPipe } from '@angular/common';
import { TaskPriority, TaskStatus } from '../../core/types/task.types';
import { TaskActions } from '../../core/store/tasks/tasks.actions';
import {
  selectFilteredTasks,
  selectTaskCountByStatus,
} from '../../core/store/tasks/tasks.selectors';

type StatusFilter = TaskStatus | 'all';

@Component({
  selector: 'app-dashboard',
  imports: [StatCardComponent, TaskFilterBarComponent, TaskBoardComponent, AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly statistics$ = this.store.select(selectAllStatistics);
  protected readonly filteredTasks$ = this.store.select(selectFilteredTasks);
  protected readonly taskCounts$ = this.store.select(selectTaskCountByStatus);

  protected activeStatus: StatusFilter = 'all';
  protected activePriority: TaskPriority | null = null;

  public ngOnInit(): void {
    this.store.dispatch(StatisticsActions.loadStatistics());
    this.store.dispatch(TaskActions.loadTasks());
  }

  protected onStatusChange(status: StatusFilter): void {
    this.activeStatus = status;
    this.store.dispatch(
      TaskActions.setFilter({ filter: { status: status === 'all' ? null : status } }),
    );
  }

  protected onPriorityChange(priority: TaskPriority | null): void {
    this.activePriority = priority;
    this.store.dispatch(TaskActions.setFilter({ filter: { priority } }));
  }

  protected onNewTask(): void {
    // TODO: open create task modal
  }
}

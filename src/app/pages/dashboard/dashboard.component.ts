import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { StatisticsActions } from '../../core/store/statistics/statistics.actions';
import { selectAllStatistics } from '../../core/store/statistics/statistics.selectors';
import { StatCardComponent } from '../../dashboard/components/stat-card/stat-card.component';
import { TaskFilterBarComponent } from '../../dashboard/components/task-filter-bar/task-filter-bar.component';
import { AsyncPipe } from '@angular/common';
import { TaskPriority, TaskStatus } from '../../core/types/task.types';

type StatusFilter = TaskStatus | 'all';

@Component({
  selector: 'app-dashboard',
  imports: [StatCardComponent, TaskFilterBarComponent, AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly statistics$ = this.store.select(selectAllStatistics);

  protected activeStatus: StatusFilter = 'all';
  protected activePriority: TaskPriority | null = null;

  public ngOnInit(): void {
    this.store.dispatch(StatisticsActions.loadStatistics());
  }

  protected onNewTask(): void {
    // TODO: open create task modal
  }
}

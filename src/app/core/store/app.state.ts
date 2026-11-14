import { StatisticsState } from './statistics/statistics.state';
import { TasksState } from './tasks/tasks.state';

export interface AppState {
  tasks: TasksState;
  statistics: StatisticsState;
}

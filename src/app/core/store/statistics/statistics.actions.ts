import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StatisticsResponse } from '../../types/statistic.types';

export const StatisticsActions = createActionGroup({
  source: 'Statistics',
  events: {
    'Load Statistics': emptyProps(),
    'Load Statistics Success': props<{ response: StatisticsResponse }>(),
    'Load Statistics Failure': props<{ error: string }>(),
    'Load Statistics Cache Hit': emptyProps(),
  },
});

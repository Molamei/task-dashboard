import { createReducer, on } from '@ngrx/store';
import { StatisticsActions } from './statistics.actions';
import { initialStatisticsState } from './statistics.state';

export const statisticsReducer = createReducer(
  initialStatisticsState,

  on(StatisticsActions.loadStatistics, state => ({ ...state, loading: true, error: null })),
  on(StatisticsActions.loadStatisticsSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    statistics: response.statistics,
    lastUpdated: response.lastUpdated,
    lastFetched: Date.now(),
  })),
  on(StatisticsActions.loadStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(StatisticsActions.loadStatisticsCacheHit, state => ({ ...state, loading: false })),
);

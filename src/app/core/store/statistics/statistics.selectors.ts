import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StatisticsState } from './statistics.state';

export const selectStatisticsFeature = createFeatureSelector<StatisticsState>('statistics');

export const selectAllStatistics = createSelector(selectStatisticsFeature, s => s.statistics);
export const selectStatisticsLoading = createSelector(selectStatisticsFeature, s => s.loading);
export const selectStatisticsError = createSelector(selectStatisticsFeature, s => s.error);
export const selectStatisticsLastUpdated = createSelector(selectStatisticsFeature, s => s.lastUpdated);
export const selectStatisticsLastFetched = createSelector(selectStatisticsFeature, s => s.lastFetched);

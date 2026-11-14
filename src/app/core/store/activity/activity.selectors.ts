import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ActivityState } from './activity.state';

export const selectActivityFeature = createFeatureSelector<ActivityState>('activity');

export const selectAllActivityEvents = createSelector(selectActivityFeature, (s) => s.events);

export const selectRecentActivityEvents = createSelector(selectAllActivityEvents, (events) =>
  events.slice(0, 10),
);

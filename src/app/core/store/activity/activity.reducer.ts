import { createReducer, on } from '@ngrx/store';
import { ActivityEvent } from '../../types/activity.types';
import { ActivityActions } from './activity.actions';
import { initialActivityState, MAX_ACTIVITY_EVENTS } from './activity.state';

export const activityReducer = createReducer(
  initialActivityState,

  on(ActivityActions.addEvent, (state, { event }) => ({
    ...state,
    events: [event, ...state.events].slice(0, MAX_ACTIVITY_EVENTS),
  })),

  on(ActivityActions.clearEvents, (state) => ({
    ...state,
    events: [] as ActivityEvent[],
  })),
);

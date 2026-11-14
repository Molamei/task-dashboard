import { createReducer, on } from '@ngrx/store';
import { ActivityEvent } from '../../types/activity.types';
import { ActivityActions } from './activity.actions';
import { initialActivityState, MAX_ACTIVITY_EVENTS } from './activity.state';

/**
 * Pure reducer that manages the `activity` feature slice.
 *
 * New events are **prepended** so the feed always displays newest-first.
 * The list is sliced to `MAX_ACTIVITY_EVENTS` after each insertion to bound
 * memory growth for long-running sessions.
 */
export const activityReducer = createReducer(
  initialActivityState,

  /**
   * Prepends the new event and trims the list to the configured maximum.
   * Oldest events fall off the end when the cap is reached.
   */
  on(ActivityActions.addEvent, (state, { event }) => ({
    ...state,
    events: [event, ...state.events].slice(0, MAX_ACTIVITY_EVENTS),
  })),

  /** Removes all activity events (e.g. when the user clicks "Clear"). */
  on(ActivityActions.clearEvents, (state) => ({
    ...state,
    events: [] as ActivityEvent[],
  })),
);

import { ActivityEvent } from '../../types/activity.types';

export interface ActivityState {
  events: ActivityEvent[];
}

export const initialActivityState: ActivityState = {
  events: [],
};

export const MAX_ACTIVITY_EVENTS = 20;

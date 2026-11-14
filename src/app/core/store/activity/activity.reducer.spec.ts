import { activityReducer } from './activity.reducer';
import { initialActivityState, MAX_ACTIVITY_EVENTS } from './activity.state';
import { ActivityActions } from './activity.actions';
import type { ActivityEvent } from '../../types/activity.types';

const makeEvent = (id: string, timestamp = Date.now()): ActivityEvent => ({
  id,
  type: 'task_created',
  taskId: `task-${id}`,
  taskTitle: `Task ${id}`,
  timestamp,
});

describe('Activity Reducer', () => {
  it('returns initial state for an unknown action', () => {
    const state = activityReducer(undefined, { type: '__UNKNOWN__' } as never);
    expect(state).toEqual(initialActivityState);
  });

  describe('addEvent', () => {
    it('prepends the new event to the front of the list', () => {
      const existing = makeEvent('old');
      const incoming = makeEvent('new');
      const state = activityReducer(
        { events: [existing] },
        ActivityActions.addEvent({ event: incoming }),
      );
      expect(state.events[0]).toEqual(incoming);
      expect(state.events[1]).toEqual(existing);
    });

    it('keeps events when below the max limit', () => {
      const state = activityReducer(
        { events: [makeEvent('a')] },
        ActivityActions.addEvent({ event: makeEvent('b') }),
      );
      expect(state.events).toHaveLength(2);
    });

    it('does not exceed MAX_ACTIVITY_EVENTS', () => {
      const full = Array.from({ length: MAX_ACTIVITY_EVENTS }, (_, i) => makeEvent(`e${i}`));
      const state = activityReducer(
        { events: full },
        ActivityActions.addEvent({ event: makeEvent('overflow') }),
      );
      expect(state.events).toHaveLength(MAX_ACTIVITY_EVENTS);
    });

    it('drops the oldest event (last in array) when at capacity', () => {
      const full = Array.from({ length: MAX_ACTIVITY_EVENTS }, (_, i) => makeEvent(`e${i}`));
      const overflow = makeEvent('overflow');
      const state = activityReducer(
        { events: full },
        ActivityActions.addEvent({ event: overflow }),
      );
      const ids = state.events.map((e) => e.id);
      expect(ids[0]).toBe('overflow');
      expect(ids).not.toContain(`e${MAX_ACTIVITY_EVENTS - 1}`);
    });
  });

  describe('clearEvents', () => {
    it('empties the events array', () => {
      const state = activityReducer(
        { events: [makeEvent('e1'), makeEvent('e2')] },
        ActivityActions.clearEvents(),
      );
      expect(state.events).toHaveLength(0);
    });

    it('is a no-op on an already-empty list', () => {
      const state = activityReducer(initialActivityState, ActivityActions.clearEvents());
      expect(state.events).toHaveLength(0);
    });
  });
});

import { selectAllActivityEvents, selectRecentActivityEvents } from './activity.selectors';
import { initialActivityState } from './activity.state';
import type { ActivityEvent } from '../../types/activity.types';

const makeEvent = (id: string): ActivityEvent => ({
  id,
  type: 'task_updated',
  taskId: `task-${id}`,
  taskTitle: `Task ${id}`,
  timestamp: Date.now(),
});

const buildState = (events: ActivityEvent[]) => ({
  activity: { ...initialActivityState, events },
});

describe('Activity Selectors', () => {
  describe('selectAllActivityEvents', () => {
    it('returns all events', () => {
      const events = [makeEvent('e1'), makeEvent('e2')];
      expect(selectAllActivityEvents(buildState(events) as never)).toEqual(events);
    });

    it('returns an empty array when there are no events', () => {
      expect(selectAllActivityEvents(buildState([]) as never)).toEqual([]);
    });
  });

  describe('selectRecentActivityEvents', () => {
    it('returns all events when there are fewer than 10', () => {
      const events = [makeEvent('e1'), makeEvent('e2'), makeEvent('e3')];
      const result = selectRecentActivityEvents(buildState(events) as never);
      expect(result).toHaveLength(3);
    });

    it('returns exactly the first 10 events when there are more', () => {
      const events = Array.from({ length: 15 }, (_, i) => makeEvent(`e${i}`));
      const result = selectRecentActivityEvents(buildState(events) as never);
      expect(result).toHaveLength(10);
      expect(result[0].id).toBe('e0');
      expect(result[9].id).toBe('e9');
    });

    it('does not include events beyond index 9', () => {
      const events = Array.from({ length: 12 }, (_, i) => makeEvent(`e${i}`));
      const result = selectRecentActivityEvents(buildState(events) as never);
      const ids = result.map((e) => e.id);
      expect(ids).not.toContain('e10');
      expect(ids).not.toContain('e11');
    });
  });
});

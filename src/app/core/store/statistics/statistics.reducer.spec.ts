import { statisticsReducer } from './statistics.reducer';
import { initialStatisticsState } from './statistics.state';
import { StatisticsActions } from './statistics.actions';
import type { StatisticsResponse } from '../../types/statistic.types';

const mockResponse: StatisticsResponse = {
  statistics: [
    {
      id: 's1',
      title: 'Total Tasks',
      icon: '📋',
      value: 10,
      change: '+2',
      changeLabel: 'since last week',
      changeType: 'positive',
      color: '#388e3c',
    },
  ],
  lastUpdated: '2025-01-01T00:00:00Z',
};

describe('Statistics Reducer', () => {
  it('returns initial state for an unknown action', () => {
    const state = statisticsReducer(undefined, { type: '__UNKNOWN__' } as never);
    expect(state).toEqual(initialStatisticsState);
  });

  describe('loadStatistics', () => {
    it('sets loading to true and clears any existing error', () => {
      const state = statisticsReducer(
        { ...initialStatisticsState, error: 'old error' },
        StatisticsActions.loadStatistics(),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('loadStatisticsSuccess', () => {
    it('stores statistics, clears loading, and records lastFetched', () => {
      const before = Date.now();
      const state = statisticsReducer(
        { ...initialStatisticsState, loading: true },
        StatisticsActions.loadStatisticsSuccess({ response: mockResponse }),
      );
      expect(state.loading).toBe(false);
      expect(state.statistics).toEqual(mockResponse.statistics);
      expect(state.lastUpdated).toBe(mockResponse.lastUpdated);
      expect(state.lastFetched).toBeGreaterThanOrEqual(before);
    });
  });

  describe('loadStatisticsFailure', () => {
    it('stores the error message and clears loading', () => {
      const state = statisticsReducer(
        { ...initialStatisticsState, loading: true },
        StatisticsActions.loadStatisticsFailure({ error: 'timeout' }),
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('timeout');
    });
  });

  describe('loadStatisticsCacheHit', () => {
    it('clears the loading flag without changing statistics', () => {
      const withStats = {
        ...initialStatisticsState,
        loading: true,
        statistics: mockResponse.statistics,
      };
      const state = statisticsReducer(withStats, StatisticsActions.loadStatisticsCacheHit());
      expect(state.loading).toBe(false);
      expect(state.statistics).toEqual(mockResponse.statistics);
    });
  });
});

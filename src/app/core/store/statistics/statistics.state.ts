import { Statistic } from '../../types/statistic.types';

export interface StatisticsState {
  statistics: Statistic[];
  lastUpdated: string | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

export const initialStatisticsState: StatisticsState = {
  statistics: [],
  lastUpdated: null,
  loading: false,
  error: null,
  lastFetched: null,
};

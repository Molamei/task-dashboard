import { ChangeTextPipe } from './change-text.pipe';
import type { Statistic } from '../../../core/types/statistic.types';

const makeStat = (overrides: Partial<Statistic>): Statistic => ({
  id: 's1',
  title: 'Total Tasks',
  icon: '📋',
  value: 10,
  change: '+2',
  changeLabel: 'since last week',
  changeType: 'positive',
  color: '#388e3c',
  ...overrides,
});

describe('ChangeTextPipe', () => {
  let pipe: ChangeTextPipe;

  beforeEach(() => {
    pipe = new ChangeTextPipe();
  });

  it('prefixes changeLabel with the change value for a positive changeType', () => {
    const stat = makeStat({ change: '+5', changeLabel: 'this week', changeType: 'positive' });
    expect(pipe.transform(stat)).toBe('+5 this week');
  });

  it('prefixes changeLabel with the change value for a negative changeType', () => {
    const stat = makeStat({ change: '-3', changeLabel: 'vs yesterday', changeType: 'negative' });
    expect(pipe.transform(stat)).toBe('-3 vs yesterday');
  });

  it('returns only the changeLabel for a neutral changeType (no change prefix)', () => {
    const stat = makeStat({ change: '0', changeLabel: 'No change', changeType: 'neutral' });
    expect(pipe.transform(stat)).toBe('No change');
  });
});

import { PriorityLabelPipe } from './priority-label.pipe';

describe('PriorityLabelPipe', () => {
  let pipe: PriorityLabelPipe;

  beforeEach(() => {
    pipe = new PriorityLabelPipe();
  });

  it('capitalizes "high"', () => {
    expect(pipe.transform('high')).toBe('High');
  });

  it('capitalizes "medium"', () => {
    expect(pipe.transform('medium')).toBe('Medium');
  });

  it('capitalizes "low"', () => {
    expect(pipe.transform('low')).toBe('Low');
  });

  it('returns "Priority" placeholder when value is null', () => {
    expect(pipe.transform(null)).toBe('Priority');
  });
});

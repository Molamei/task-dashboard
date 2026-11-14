import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ActivityFeedComponent } from './activity-feed.component';
import type { ActivityEvent, ActivityEventType } from '../../../core/types/activity.types';

const makeEvent = (type: ActivityEventType, timestamp: number, id = 'e1'): ActivityEvent => ({
  id,
  type,
  taskId: 'task-001',
  taskTitle: 'Test Task',
  timestamp,
});

describe('ActivityFeedComponent', () => {
  let fixture: ComponentFixture<ActivityFeedComponent>;
  let component: ActivityFeedComponent;

  const NOW = new Date('2025-06-15T12:00:00').getTime();

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    await TestBed.configureTestingModule({
      imports: [ActivityFeedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityFeedComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('events', []);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // --- enrichedEvents config mapping ---

  it('maps task_created to the correct icon and colour', () => {
    const event = makeEvent('task_created', NOW - 10_000);
    fixture.componentRef.setInput('events', [event]);
    const enriched = (
      component as never as {
        enrichedEvents: () => {
          config: { icon: string; color: string; label: string };
          timeAgo: string;
        }[];
      }
    ).enrichedEvents();
    expect(enriched[0].config.icon).toBe('✚');
    expect(enriched[0].config.color).toBe('#388e3c');
    expect(enriched[0].config.label).toBe('created');
  });

  it('maps task_updated to the correct icon and colour', () => {
    const event = makeEvent('task_updated', NOW - 10_000);
    fixture.componentRef.setInput('events', [event]);
    const enriched = (
      component as never as { enrichedEvents: () => { config: { icon: string; color: string } }[] }
    ).enrichedEvents();
    expect(enriched[0].config.icon).toBe('✎');
    expect(enriched[0].config.color).toBe('#1976d2');
  });

  it('maps task_deleted to the correct icon and colour', () => {
    const event = makeEvent('task_deleted', NOW - 10_000);
    fixture.componentRef.setInput('events', [event]);
    const enriched = (
      component as never as { enrichedEvents: () => { config: { icon: string; color: string } }[] }
    ).enrichedEvents();
    expect(enriched[0].config.icon).toBe('✕');
    expect(enriched[0].config.color).toBe('#d32f2f');
  });

  it('maps task_status_changed to the correct icon and colour', () => {
    const event = makeEvent('task_status_changed', NOW - 10_000);
    fixture.componentRef.setInput('events', [event]);
    const enriched = (
      component as never as { enrichedEvents: () => { config: { icon: string; color: string } }[] }
    ).enrichedEvents();
    expect(enriched[0].config.icon).toBe('↻');
    expect(enriched[0].config.color).toBe('#ff6f00');
  });

  // --- timeAgo formatting ---

  it('shows "just now" for events within the last 60 seconds', () => {
    const event = makeEvent('task_created', NOW - 30_000);
    fixture.componentRef.setInput('events', [event]);
    const enriched = (
      component as never as { enrichedEvents: () => { timeAgo: string }[] }
    ).enrichedEvents();
    expect(enriched[0].timeAgo).toBe('just now');
  });

  it('shows "Xm ago" for events 1–59 minutes old', () => {
    const event = makeEvent('task_created', NOW - 90_000); // 1.5 minutes → 1m
    fixture.componentRef.setInput('events', [event]);
    const enriched = (
      component as never as { enrichedEvents: () => { timeAgo: string }[] }
    ).enrichedEvents();
    expect(enriched[0].timeAgo).toBe('1m ago');
  });

  it('shows "Xm ago" for events 30 minutes old', () => {
    const event = makeEvent('task_created', NOW - 30 * 60_000);
    fixture.componentRef.setInput('events', [event]);
    const enriched = (
      component as never as { enrichedEvents: () => { timeAgo: string }[] }
    ).enrichedEvents();
    expect(enriched[0].timeAgo).toBe('30m ago');
  });

  it('shows "Xh ago" for events 1–23 hours old', () => {
    const event = makeEvent('task_created', NOW - 2 * 3_600_000); // 2 hours
    fixture.componentRef.setInput('events', [event]);
    const enriched = (
      component as never as { enrichedEvents: () => { timeAgo: string }[] }
    ).enrichedEvents();
    expect(enriched[0].timeAgo).toBe('2h ago');
  });

  it('shows "Xd ago" for events 1+ days old', () => {
    const event = makeEvent('task_created', NOW - 2 * 86_400_000); // 2 days
    fixture.componentRef.setInput('events', [event]);
    const enriched = (
      component as never as { enrichedEvents: () => { timeAgo: string }[] }
    ).enrichedEvents();
    expect(enriched[0].timeAgo).toBe('2d ago');
  });

  it('enriches multiple events in order', () => {
    const events = [
      makeEvent('task_created', NOW - 10_000, 'e1'),
      makeEvent('task_updated', NOW - 120_000, 'e2'),
    ];
    fixture.componentRef.setInput('events', events);
    const enriched = (
      component as never as { enrichedEvents: () => { id: string; timeAgo: string }[] }
    ).enrichedEvents();
    expect(enriched).toHaveLength(2);
    expect(enriched[0].timeAgo).toBe('just now');
    expect(enriched[1].timeAgo).toBe('2m ago');
  });

  it('returns an empty array when events input is empty', () => {
    fixture.componentRef.setInput('events', []);
    const enriched = (component as never as { enrichedEvents: () => unknown[] }).enrichedEvents();
    expect(enriched).toHaveLength(0);
  });
});

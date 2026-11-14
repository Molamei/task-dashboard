import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivityEvent, ActivityEventType } from '../../../core/types/activity.types';

const EVENT_CONFIG: Record<ActivityEventType, { icon: string; color: string; label: string }> = {
  task_created: { icon: '✚', color: '#388e3c', label: 'created' },
  task_updated: { icon: '✎', color: '#1976d2', label: 'updated' },
  task_deleted: { icon: '✕', color: '#d32f2f', label: 'deleted' },
  task_status_changed: { icon: '↻', color: '#ff6f00', label: 'status changed' },
};

@Component({
  selector: 'app-activity-feed',
  imports: [TitleCasePipe],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeedComponent {
  readonly events = input.required<ActivityEvent[]>();

  protected readonly enrichedEvents = computed(() =>
    this.events().map((e) => ({
      ...e,
      config: EVENT_CONFIG[e.type],
      timeAgo: this.formatTimeAgo(e.timestamp),
    })),
  );

  private formatTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}

export type ActivityEventType =
  'task_created' | 'task_updated' | 'task_deleted' | 'task_status_changed';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  taskId: string;
  taskTitle: string;
  timestamp: number;
  meta?: Record<string, string>;
}

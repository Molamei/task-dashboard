import type { TaskPriority, TaskStatus } from './task.types';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#D32F2F',
  medium: '#FF6F00',
  low: '#388E3C',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#1976D2',
  in_progress: '#FF6F00',
  done: '#388E3C',
};

export const STATUS_FILTER_TABS = [
  { label: 'All', value: 'all' as const },
  ...Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
    label,
    value: value as TaskStatus,
  })),
];

export const PRIORITY_FILTER_OPTIONS = [
  { label: 'All', value: null as TaskPriority | null },
  ...Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
    label,
    value: value as TaskPriority,
  })),
];

export const API_ENDPOINTS = {
  tasks: 'api/tasks',
  statistics: 'api/statistics',
  users: 'api/users',
} as const;

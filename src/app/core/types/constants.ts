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

/** Cycling palette used to colour assignee avatar initials by numeric ID. */
export const AVATAR_COLORS = ['#3B82F6', '#22C55E', '#F97316', '#8B5CF6', '#06B6D4'] as const;

/** Card hover-shadow colour per task status. */
export const TASK_STATUS_SHADOW: Record<TaskStatus, string> = {
  todo: 'rgba(25, 118, 210, 0.35)',
  in_progress: 'rgba(255, 111, 0, 0.35)',
  done: 'rgba(56, 142, 60, 0.35)',
};

/** Badge background and text colour per priority level. */
export const TASK_PRIORITY_BADGE: Record<TaskPriority, { bg: string; color: string }> = {
  high: { bg: '#D32F2F', color: '#FFFFFF' },
  medium: { bg: '#FEF3C7', color: '#D97706' },
  low: { bg: '#DCFCE7', color: '#16A34A' },
};

export const API_ENDPOINTS = {
  tasks: 'api/tasks',
  statistics: 'api/statistics',
  users: 'api/users',
} as const;

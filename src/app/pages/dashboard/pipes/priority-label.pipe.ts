import { Pipe, PipeTransform } from '@angular/core';
import { TaskPriority } from '../../../core/types/task.types';

@Pipe({ name: 'priorityLabel', standalone: true })
export class PriorityLabelPipe implements PipeTransform {
  transform(value: TaskPriority | null): string {
    if (!value) return $localize`:filter|default priority filter label@@priority.default:Priority`;
    switch (value) {
      case 'high':
        return $localize`:task priority|high@@priority.high:High`;
      case 'medium':
        return $localize`:task priority|medium@@priority.medium:Medium`;
      case 'low':
        return $localize`:task priority|low@@priority.low:Low`;
      default:
        return (value as string).charAt(0).toUpperCase() + (value as string).slice(1);
    }
  }
}

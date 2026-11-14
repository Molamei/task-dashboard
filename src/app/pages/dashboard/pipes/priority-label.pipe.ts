import { Pipe, PipeTransform } from '@angular/core';
import { TaskPriority } from '../../../core/types/task.types';

@Pipe({ name: 'priorityLabel', standalone: true })
export class PriorityLabelPipe implements PipeTransform {
  transform(value: TaskPriority | null): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Priority';
  }
}

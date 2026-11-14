import { Pipe, PipeTransform } from '@angular/core';
import { Statistic } from '../../core/types/statistic.types';

@Pipe({ name: 'changeText', standalone: true })
export class ChangeTextPipe implements PipeTransform {
  transform({ change, changeLabel, changeType }: Statistic): string {
    return changeType === 'neutral' ? changeLabel : `${change} ${changeLabel}`;
  }
}

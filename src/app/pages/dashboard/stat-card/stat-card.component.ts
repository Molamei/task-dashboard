import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Statistic } from '../../../core/types/statistic.types';
import { ChangeTextPipe } from '../pipes/change-text.pipe';

@Component({
  selector: 'app-stat-card',
  imports: [ChangeTextPipe],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly stat = input.required<Statistic>();
}

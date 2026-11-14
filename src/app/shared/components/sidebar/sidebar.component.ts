import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly newTask = output<void>();
}

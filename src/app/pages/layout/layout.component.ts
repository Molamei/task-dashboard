import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TaskActions } from '../../core/store/tasks/tasks.actions';
import { TaskModalService } from '../../core/services/task-modal.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private readonly store = inject(Store);
  private readonly taskModal = inject(TaskModalService);

  protected onSearch(query: string): void {
    this.store.dispatch(TaskActions.setFilter({ filter: { search: query } }));
  }

  protected onNewTask(): void {
    this.taskModal.requestOpen();
  }
}

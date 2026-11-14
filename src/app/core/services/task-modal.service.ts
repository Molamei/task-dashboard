import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TaskModalService {
  readonly pendingOpen = signal(false);

  requestOpen(): void {
    this.pendingOpen.set(true);
  }

  consume(): void {
    this.pendingOpen.set(false);
  }
}

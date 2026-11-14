import { Injectable, signal } from '@angular/core';

/**
 * Thin signal-based bridge that lets the app header trigger the task-creation
 * modal in `DashboardComponent` without a direct component reference.
 *
 * Usage flow:
 * 1. Header calls `requestOpen()` → sets `pendingOpen` to `true`.
 * 2. `DashboardComponent` watches `pendingOpen` via an `effect()`, opens the
 *    modal, then calls `consume()` to reset the flag.
 */
@Injectable({ providedIn: 'root' })
export class TaskModalService {
  /** `true` when an open request is pending but has not yet been consumed. */
  readonly pendingOpen = signal(false);

  /** Signals that the modal should open on the next render cycle. */
  requestOpen(): void {
    this.pendingOpen.set(true);
  }

  /** Resets the pending flag after the consumer has reacted to it. */
  consume(): void {
    this.pendingOpen.set(false);
  }
}

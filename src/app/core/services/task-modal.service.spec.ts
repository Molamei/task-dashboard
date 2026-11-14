import { TestBed } from '@angular/core/testing';
import { TaskModalService } from './task-modal.service';

describe('TaskModalService', () => {
  let service: TaskModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskModalService);
  });

  it('initialises pendingOpen as false', () => {
    expect(service.pendingOpen()).toBe(false);
  });

  it('requestOpen sets pendingOpen to true', () => {
    service.requestOpen();
    expect(service.pendingOpen()).toBe(true);
  });

  it('consume resets pendingOpen back to false', () => {
    service.requestOpen();
    service.consume();
    expect(service.pendingOpen()).toBe(false);
  });

  it('calling consume without requestOpen keeps pendingOpen false', () => {
    service.consume();
    expect(service.pendingOpen()).toBe(false);
  });

  it('successive requestOpen calls leave pendingOpen true', () => {
    service.requestOpen();
    service.requestOpen();
    expect(service.pendingOpen()).toBe(true);
  });
});

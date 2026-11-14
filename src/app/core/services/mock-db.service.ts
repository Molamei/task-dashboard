import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';
import tasksData from '../../../assets/data/tasks.json';
import statisticsData from '../../../assets/data/statistics.json';
import usersData from '../../../assets/data/users.json';

/**
 * In-memory mock database that powers `angular-in-memory-web-api`.
 *
 * Loads seed data from JSON assets and exposes `tasks`, `statistics`, and
 * `users` as REST-like collections under `/api/*`. The `get()` override is
 * required because the web-api treats every collection as an array, but the
 * statistics endpoint must return a single object — not `[statisticsData]`.
 */
@Injectable({ providedIn: 'root' })
export class MockDbService implements InMemoryDbService {
  /**
   * Returns the initial in-memory collections keyed by endpoint name.
   * `statistics` is wrapped in an array here so the web-api can store it, but
   * the custom `get()` override unwraps it back to a single object on reads.
   */
  createDb(): Record<string, unknown> {
    return {
      tasks: tasksData.tasks,
      statistics: [statisticsData],
      users: usersData.users,
    };
  }

  /**
   * Intercepts GET requests for the `statistics` collection and returns the raw
   * `statisticsData` object instead of the array wrapper used internally.
   * Returns `undefined` for all other collections to fall through to the default
   * `angular-in-memory-web-api` handling.
   *
   * @param reqInfo - Request metadata provided by the in-memory web-api.
   * @returns An Observable response for `statistics`, or `undefined` otherwise.
   */
  get(reqInfo: RequestInfo): Observable<unknown> | undefined {
    if (reqInfo.collectionName === 'statistics') {
      return reqInfo.utils.createResponse$(() => ({
        status: 200,
        body: statisticsData,
      }));
    }
    return undefined;
  }
}

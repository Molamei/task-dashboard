import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';
import tasksData from '../../../assets/data/tasks.json';
import statisticsData from '../../../assets/data/statistics.json';
import usersData from '../../../assets/data/users.json';

@Injectable({ providedIn: 'root' })
export class MockDbService implements InMemoryDbService {
  createDb(): Record<string, unknown> {
    return {
      tasks: tasksData.tasks,
      statistics: [statisticsData],
      users: usersData.users,
    };
  }

  /** Return statistics as a single object instead of a collection */
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

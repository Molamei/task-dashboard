import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TaskApiService } from '../../services/task-api.service';
import { StatisticsActions } from './statistics.actions';
import { selectStatisticsLastFetched } from './statistics.selectors';

const CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class StatisticsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly taskApi = inject(TaskApiService);

  loadStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StatisticsActions.loadStatistics),
      withLatestFrom(this.store.select(selectStatisticsLastFetched)),
      switchMap(([, lastFetched]) => {
        if (lastFetched && Date.now() - lastFetched < CACHE_TTL_MS) {
          return of(StatisticsActions.loadStatisticsCacheHit());
        }
        return this.taskApi.getStatistics().pipe(
          map(response => StatisticsActions.loadStatisticsSuccess({ response })),
          catchError(err => of(StatisticsActions.loadStatisticsFailure({ error: err.message }))),
        );
      }),
    ),
  );
}

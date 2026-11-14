import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { tasksReducer } from './core/store/tasks/tasks.reducer';
import { statisticsReducer } from './core/store/statistics/statistics.reducer';
import { activityReducer } from './core/store/activity/activity.reducer';
import { TasksEffects } from './core/store/tasks/tasks.effects';
import { StatisticsEffects } from './core/store/statistics/statistics.effects';
import { MockDbService } from './core/services/mock-db.service';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([cacheInterceptor])),
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(MockDbService, {
        dataEncapsulation: false,
        delay: 300,
        passThruUnknownUrl: true,
      }),
    ),
    provideStore({
      tasks: tasksReducer,
      statistics: statisticsReducer,
      activity: activityReducer,
    }),
    provideEffects([TasksEffects, StatisticsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};

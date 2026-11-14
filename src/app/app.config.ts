import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { tasksReducer } from './core/store/tasks/tasks.reducer';
import { statisticsReducer } from './core/store/statistics/statistics.reducer';
import { TasksEffects } from './core/store/tasks/tasks.effects';
import { StatisticsEffects } from './core/store/statistics/statistics.effects';
import { MockDbService } from './core/services/mock-db.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
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
    }),
    provideEffects([TasksEffects, StatisticsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};

import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<unknown>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Caches GET responses for 5 minutes to avoid redundant API calls. */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    // Mutations invalidate cached reads for the same collection
    const baseUrl = req.url.split('/').slice(0, -1).join('/');
    cache.delete(req.url);
    cache.delete(baseUrl);
    return next(req);
  }

  const cached = cache.get(req.url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return of(cached.response.clone());
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, { response: event, timestamp: Date.now() });
      }
    }),
  );
};

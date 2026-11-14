import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';

/** Cached HTTP response with the time it was stored. */
interface CacheEntry {
  response: HttpResponse<unknown>;
  timestamp: number;
}

/** Module-level in-memory store keyed by request URL. */
const cache = new Map<string, CacheEntry>();

/** GET responses remain valid for 5 minutes before a fresh request is made. */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * HTTP interceptor that caches GET responses for {@link CACHE_TTL_MS} milliseconds.
 *
 * **Cache strategy:**
 * - GET requests: served from cache when a fresh entry exists; otherwise the
 *   response is stored after a successful round-trip.
 * - Mutating requests (POST / PUT / DELETE): the entry for the exact URL **and**
 *   its parent collection URL are both invalidated so the next GET returns fresh
 *   data. The parent URL is derived by stripping the last path segment (the ID).
 *
 * Note: the cache is module-scoped (not injector-scoped), so it persists for the
 * lifetime of the page and is shared across all injection contexts.
 */
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

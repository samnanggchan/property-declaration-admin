import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { logoutUser } from '../slices/authSlice';

// Mutex prevents race conditions and multiple parallel calls to /api/auth/refresh
const mutex = new Mutex();

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003';

/**
 * Base fetchBaseQuery instance configured with credentials: 'include'.
 * The browser automatically transmits and receives HttpOnly cookies
 * (access_token, refresh_token) on every cross-origin request.
 * JavaScript never has direct access to the token strings.
 */
export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * Custom baseQuery wrapper implementing automatic Token Rotation & Reauth.
 *
 * Flow:
 * 1. Checks mutex.waitForUnlock() before initiating any request.
 * 2. Executes request with HttpOnly cookies.
 * 3. On 401 Unauthorized:
 *    a. Pauses/locks subsequent incoming queries via Mutex.
 *    b. Hits POST /api/auth/refresh (browser automatically attaches refresh_token cookie).
 *    c. If refresh succeeds:
 *       - Backend responds with new rotated tokens in Set-Cookie headers.
 *       - Mutex unlocks.
 *       - Automatically retries the original request.
 *    d. If refresh fails (expired or revoked token):
 *       - Dispatches logoutUser() to clear Redux auth state.
 *       - Redirects user to /login.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait until any active refresh has unlocked
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Only one refresh request allowed at a time
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          {
            url: '/api/auth/refresh',
            method: 'POST',
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          // Refresh succeeded: retry original request with the new access cookie
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed: token expired, family revoked, or unauthorized
          api.dispatch(logoutUser());
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } finally {
        release();
      }
    } else {
      // Another query is currently executing the refresh; wait for it to finish and retry
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

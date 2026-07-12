import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseConfig } from './config';
import type { Database } from './types';
import type { User } from '@supabase/supabase-js';

export interface MiddlewareResult {
  response: NextResponse;
  user: User | null;
}

// Refreshes the Supabase session and returns the updated response with cookies.
// Must be called at the top of Next.js middleware to keep sessions alive.
export async function updateSession(request: NextRequest): Promise<MiddlewareResult> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() validates the token and refreshes it if needed.
  // IMPORTANT: use getUser(), not getSession() — getSession() does not validate the token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

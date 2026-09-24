'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGetMeQuery } from '@/lib/redux/api/authApi';
import { useAppSelector } from '@/lib/redux/hooks';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError } = useGetMeQuery();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && (isError || (!data && !isAuthenticated))) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isError, data, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  if (isError || (!data && !isAuthenticated)) {
    return null;
  }

  return <>{children}</>;
}

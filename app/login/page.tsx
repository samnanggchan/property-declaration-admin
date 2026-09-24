'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ShineBorder } from '@/components/ui/shine-border';
import { useLoginMutation } from '@/lib/redux/api/authApi';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      toast.success(`Welcome back, ${res.user.email}!`);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Invalid credentials. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info('Filled credentials');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-zinc-950 font-sans select-none">
      {/* City nightscape blurred background matching reference image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter blur-[3px] opacity-75"
        style={{ backgroundImage: `url('/login-bg.jpeg')` }}
      />
      {/* Dark gradient backdrop overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/70 backdrop-blur-sm" />

      {/* Main card with MagicUI ShineBorder */}
      <div className="relative z-10 w-full max-w-[420px]">
        <ShineBorder
          borderRadius={26}
          borderWidth={1.5}
          duration={12}
          color={['#ffffff', '#a5b4fc', '#f472b6']}
          className="p-0 overflow-hidden shadow-2xl shadow-black/80"
        >
          <div className="w-full bg-zinc-950/80 backdrop-blur-2xl rounded-[24px] p-8 sm:p-9 border border-white/10 text-white">
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Sign in to access the dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Username / Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-12 px-4 rounded-xl bg-[#e9f0fc] text-zinc-900 font-medium placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all border-0"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-12 pl-4 pr-11 rounded-xl bg-[#e9f0fc] text-zinc-900 font-medium placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all border-0 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      toast.info('Contact administrator to reset password.')
                    }
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-4 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.99] transition-all flex items-center justify-center shadow-lg shadow-black/30 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col items-center gap-1.5 text-xs text-zinc-500">
              <span>Quick Demo Credentials:</span>
              <button
                type="button"
                onClick={() => handleFillDemo('admin@example.com', 'Password123!')}
                className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                admin@example.com (Super Admin)
              </button>
            </div>
          </div>
        </ShineBorder>
      </div>
    </div>
  );
}

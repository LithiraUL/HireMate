'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiBriefcase, FiMail, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
      <FiAlertCircle className="flex-shrink-0" /> {msg}
    </p>
  );
}

function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched]   = useState({ email: false, password: false });
  const [errors, setErrors]     = useState({ email: '', password: '' });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading]   = useState(false);

  const { user, loading: authLoading, login } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isVerified   = searchParams.get('verified') === 'true';

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'candidate') router.push('/candidate/dashboard');
      else if (user.role === 'employer') router.push('/employer/dashboard');
      else if (user.role === 'admin') router.push('/admin/dashboard');
    }
  }, [user, authLoading, router]);

  const validate = (e: string, p: string) => ({
    email:    !e.trim() ? 'Email is required.' : !EMAIL_RE.test(e) ? 'Enter a valid email address.' : '',
    password: !p        ? 'Password is required.' : p.length < 6 ? 'Password must be at least 6 characters.' : '',
  });

  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (touched.email) setErrors(validate(v, password));
  };
  const handlePasswordChange = (v: string) => {
    setPassword(v);
    if (touched.password) setErrors(validate(email, v));
  };
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate(email, password));
  };

  const inputClass = (field: 'email' | 'password') =>
    `w-full px-4 py-3 pl-11 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
      touched[field] && errors[field]
        ? 'border-red-400 focus:ring-red-400 bg-red-50'
        : touched[field] && !errors[field]
        ? 'border-green-400 focus:ring-green-400'
        : 'border-gray-300 focus:ring-primary-500'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setTouched({ email: true, password: true });
    const currentErrors = validate(email, password);
    setErrors(currentErrors);
    if (currentErrors.email || currentErrors.password) return;

    setLoading(true);
    try {
      await login(email, password);
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectUrl);
        return;
      }
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.role === 'candidate') router.push('/candidate/dashboard');
      else if (storedUser.role === 'employer') router.push('/employer/dashboard');
      else if (storedUser.role === 'admin') router.push('/admin/dashboard');
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FiBriefcase className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back to HireMate</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">

          {isVerified && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded text-sm flex items-start gap-2">
              <FiCheckCircle className="mt-0.5 flex-shrink-0" />
              Your company account has been successfully verified! You can now log in.
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" /> {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email" type="email" autoComplete="email"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={inputClass('email')}
                  placeholder="you@example.com"
                />
              </div>
              <FieldError msg={touched.email ? errors.email : undefined} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password" type="password" autoComplete="current-password"
                  value={password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={inputClass('password')}
                  placeholder="••••••••"
                />
              </div>
              <FieldError msg={touched.password ? errors.password : undefined} />
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/register" className="w-full btn-secondary py-3 text-base text-center block">
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import { authService } from '@/lib/authService';
import Link from 'next/link';
import { FiBriefcase, FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1 animate-fadeIn">
      <FiAlertCircle className="flex-shrink-0" /> {msg}
    </p>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (val: string) => {
    if (!val.trim()) return 'Email is required.';
    if (!EMAIL_RE.test(val)) return 'Enter a valid email address.';
    return '';
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (touched) {
      setError(validate(val));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(email));
  };

  const inputClass = () =>
    `w-full px-4 py-3 pl-11 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
      touched && error
        ? 'border-red-400 focus:ring-red-400 bg-red-50'
        : touched && !error
        ? 'border-green-400 focus:ring-green-400'
        : 'border-gray-300 focus:ring-primary-500'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setTouched(true);

    const currentError = validate(email);
    setError(currentError);
    if (currentError) return;

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      setSubmitSuccess(response.message || 'If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Error processing forgot password request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100 animate-fadeIn">
          <FiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6 drop-shadow-md" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Check Your Inbox</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {submitSuccess}
          </p>
          <div className="space-y-3">
            <Link href="/login" className="w-full btn-primary py-3 inline-block font-semibold text-center rounded-lg transition-transform hover:scale-[1.02]">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FiBriefcase className="h-12 w-12 text-primary-600 drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot password?</h2>
          <p className="mt-2 text-gray-600">Enter your email and we'll send you a link to reset your password</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm flex items-start gap-2 animate-fadeIn">
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
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  onBlur={handleBlur}
                  className={inputClass()}
                  placeholder="you@example.com"
                />
              </div>
              <FieldError msg={touched ? error : undefined} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md active:translate-y-[1px]"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-semibold text-primary-600 hover:text-primary-500">
              Remember your password? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}

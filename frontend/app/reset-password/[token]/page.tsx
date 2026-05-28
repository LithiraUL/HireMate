'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';
import Link from 'next/link';
import { FiBriefcase, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1 animate-fadeIn">
      <FiAlertCircle className="flex-shrink-0" /> {msg}
    </p>
  );
}

function ResetPasswordForm() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (data: typeof formData) => {
    const e: Record<string, string> = {};

    if (!data.password) {
      e.password = 'Password is required.';
    } else if (data.password.length < 6) {
      e.password = 'Password must be at least 6 characters.';
    } else if (!/[A-Z]/.test(data.password)) {
      e.password = 'Include at least one uppercase letter.';
    } else if (!/[0-9]/.test(data.password)) {
      e.password = 'Include at least one number.';
    }

    if (!data.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (data.password !== data.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }

    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    if (touched[e.target.name]) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(t => ({ ...t, [e.target.name]: true }));
    setErrors(validate(formData));
  };

  const inputClass = (field: 'password' | 'confirmPassword') =>
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
    setSubmitSuccess('');
    setTouched({ password: true, confirmPassword: true });

    const currentErrors = validate(formData);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    if (!token) {
      setSubmitError('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(token, formData.password);
      setSubmitSuccess(response.message || 'Your password has been successfully reset.');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to reset password. The link may have expired or is invalid.');
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100 animate-fadeIn">
          <FiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6 drop-shadow-md" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Password Reset!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {submitSuccess}
          </p>
          <Link href="/login" className="w-full btn-primary py-3 inline-block font-semibold text-center rounded-lg transition-transform hover:scale-[1.02]">
            Go to Sign In
          </Link>
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
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create new password</h2>
          <p className="mt-2 text-gray-600">Please enter a strong new password below to secure your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm flex items-start gap-2 animate-fadeIn">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" /> {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('password')}
                  placeholder="••••••••"
                />
              </div>
              <FieldError msg={touched.password ? errors.password : undefined} />
              {!errors.password && (
                <p className="text-xs text-gray-400 mt-1">Min 6 chars, one uppercase letter, one number.</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('confirmPassword')}
                  placeholder="••••••••"
                />
              </div>
              <FieldError msg={touched.confirmPassword ? errors.confirmPassword : undefined} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md active:translate-y-[1px]"
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-semibold text-primary-600 hover:text-primary-500">
              Return to login page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

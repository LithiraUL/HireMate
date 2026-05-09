'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiBriefcase, FiMail, FiLock, FiUser, FiHome, FiPhone, FiMapPin, FiFileText, FiGlobe, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// ── helpers ──────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE  = /^[+]?[\d\s\-().]{7,20}$/;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
      <FiAlertCircle className="flex-shrink-0" /> {msg}
    </p>
  );
}

// ── main form component ──────────────────────────────────────────────────────
function RegisterForm() {
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyAddress: '',
    contactNo: '',
    officialEmailDomain: '',
  });
  const [documents, setDocuments] = useState<FileList | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'employer' || roleParam === 'candidate') setRole(roleParam);
  }, [searchParams]);

  // ── validation rules ──────────────────────────────────────────────────────
  const validate = (data: typeof formData, docs: FileList | null, currentRole: typeof role) => {
    const e: Record<string, string> = {};

    if (!data.name.trim()) e.name = 'Full name is required.';
    else if (data.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';

    if (!data.email.trim()) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(data.email)) e.email = 'Enter a valid email address.';

    if (!data.password) e.password = 'Password is required.';
    else if (data.password.length < 6) e.password = 'Password must be at least 6 characters.';
    else if (!/[A-Z]/.test(data.password)) e.password = 'Include at least one uppercase letter.';
    else if (!/[0-9]/.test(data.password)) e.password = 'Include at least one number.';

    if (!data.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (data.password !== data.confirmPassword) e.confirmPassword = 'Passwords do not match.';

    if (currentRole === 'employer') {
      if (!data.companyName.trim()) e.companyName = 'Company name is required.';
      if (!data.companyAddress.trim()) e.companyAddress = 'Company address is required.';
      if (!data.contactNo.trim()) e.contactNo = 'Contact number is required.';
      else if (!PHONE_RE.test(data.contactNo)) e.contactNo = 'Enter a valid phone number.';
      if (!data.officialEmailDomain.trim()) e.officialEmailDomain = 'Official email domain is required.';
      if (!docs || docs.length === 0) e.legalDocuments = 'Please upload at least one legal document.';
    }

    return e;
  };

  // ── live validation on blur ───────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    if (touched[e.target.name]) {
      setErrors(validate(updated, documents, role));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(t => ({ ...t, [e.target.name]: true }));
    setErrors(validate(formData, documents, role));
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocuments(e.target.files);
    if (touched.legalDocuments) {
      setErrors(validate(formData, e.target.files, role));
    }
  };

  const handleDocBlur = () => {
    setTouched(t => ({ ...t, legalDocuments: true }));
    setErrors(validate(formData, documents, role));
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 pl-11 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
      touched[field] && errors[field]
        ? 'border-red-400 focus:ring-red-400 bg-red-50'
        : touched[field] && !errors[field]
        ? 'border-green-400 focus:ring-green-400'
        : 'border-gray-300 focus:ring-primary-500'
    }`;

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Touch all fields so errors show
    const allFields = ['name', 'email', 'password', 'confirmPassword',
      ...(role === 'employer'
        ? ['companyName', 'companyAddress', 'contactNo', 'officialEmailDomain', 'legalDocuments']
        : [])
    ];
    setTouched(Object.fromEntries(allFields.map(f => [f, true])));

    const currentErrors = validate(formData, documents, role);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    setLoading(true);
    try {
      if (role === 'employer') {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('role', role);
        data.append('companyName', formData.companyName);
        data.append('companyAddress', formData.companyAddress);
        data.append('contactNo', formData.contactNo);
        data.append('officialEmailDomain', formData.officialEmailDomain);
        if (documents) {
          for (let i = 0; i < documents.length; i++) {
            data.append('legalDocuments', documents[i]);
          }
        }
        await register(data);
        setSubmitSuccess('Registration submitted! You will receive an email once the admin reviews your application.');
      } else {
        await register({ name: formData.name, email: formData.email, password: formData.password, role });
        router.push('/candidate/dashboard');
      }
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center">
          <FiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">{submitSuccess}</p>
          <Link href="/login" className="btn-primary px-8 py-3 inline-block">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FiBriefcase className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join HireMate</h2>
          <p className="mt-2 text-gray-600">Create your account and get started</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">I want to register as:</label>
            <div className="grid grid-cols-2 gap-4">
              {(['candidate', 'employer'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setErrors({}); setTouched({}); }}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    role === r ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {r === 'candidate' ? <FiUser className="mx-auto mb-2 h-6 w-6" /> : <FiHome className="mx-auto mb-2 h-6 w-6" />}
                  <div className="font-semibold">{r === 'candidate' ? 'Job Seeker' : 'Employer'}</div>
                  <div className="text-xs text-gray-500">{r === 'candidate' ? 'Looking for opportunities' : 'Hiring talent'}</div>
                </button>
              ))}
            </div>
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" /> {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input id="name" name="name" type="text" value={formData.name}
                  onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('name')} placeholder="John Doe" />
              </div>
              <FieldError msg={touched.name ? errors.name : undefined} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input id="email" name="email" type="email" value={formData.email}
                  onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('email')} placeholder="you@example.com" />
              </div>
              <FieldError msg={touched.email ? errors.email : undefined} />
            </div>

            {/* Employer-specific fields */}
            {role === 'employer' && (
              <>
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiHome className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="companyName" name="companyName" type="text" value={formData.companyName}
                      onChange={handleChange} onBlur={handleBlur}
                      className={inputClass('companyName')} placeholder="Your Company Ltd." />
                  </div>
                  <FieldError msg={touched.companyName ? errors.companyName : undefined} />
                </div>

                {/* Company Address */}
                <div>
                  <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="companyAddress" name="companyAddress" type="text" value={formData.companyAddress}
                      onChange={handleChange} onBlur={handleBlur}
                      className={inputClass('companyAddress')} placeholder="Colombo, Sri Lanka" />
                  </div>
                  <FieldError msg={touched.companyAddress ? errors.companyAddress : undefined} />
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="contactNo" name="contactNo" type="tel" value={formData.contactNo}
                      onChange={handleChange} onBlur={handleBlur}
                      className={inputClass('contactNo')} placeholder="+94 77 123 4567" />
                  </div>
                  <FieldError msg={touched.contactNo ? errors.contactNo : undefined} />
                </div>

                {/* Official Email Domain */}
                <div>
                  <label htmlFor="officialEmailDomain" className="block text-sm font-medium text-gray-700 mb-1">
                    Official Email Domain
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiGlobe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="officialEmailDomain" name="officialEmailDomain" type="text" value={formData.officialEmailDomain}
                      onChange={handleChange} onBlur={handleBlur}
                      className={inputClass('officialEmailDomain')} placeholder="e.g. yourcompany.com" />
                  </div>
                  <FieldError msg={touched.officialEmailDomain ? errors.officialEmailDomain : undefined} />
                </div>

                {/* Legal Documents */}
                <div>
                  <label htmlFor="legalDocuments" className="block text-sm font-medium text-gray-700 mb-1">
                    Legal Company Documents <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    touched.legalDocuments && errors.legalDocuments
                      ? 'border-red-400 bg-red-50'
                      : touched.legalDocuments && !errors.legalDocuments
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <FiFileText className="h-8 w-8 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <input id="legalDocuments" name="legalDocuments" type="file" multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleDocChange} onBlur={handleDocBlur}
                          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, JPG, PNG · max 5 MB each · business registration, tax certificate, etc.
                        </p>
                        {documents && documents.length > 0 && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            {documents.length} file{documents.length > 1 ? 's' : ''} selected
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <FieldError msg={touched.legalDocuments ? errors.legalDocuments : undefined} />
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input id="password" name="password" type="password" value={formData.password}
                  onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('password')} placeholder="••••••••" />
              </div>
              <FieldError msg={touched.password ? errors.password : undefined} />
              {!errors.password && (
                <p className="text-xs text-gray-400 mt-1">Min 6 chars, one uppercase letter, one number.</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword}
                  onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('confirmPassword')} placeholder="••••••••" />
              </div>
              <FieldError msg={touched.confirmPassword ? errors.confirmPassword : undefined} />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input id="terms" type="checkbox" required
                className="h-4 w-4 mt-0.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded flex-shrink-0" />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-500 font-medium">Terms and Conditions</Link>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? role === 'employer' ? 'Submitting...' : 'Creating account...'
                : role === 'employer' ? 'Submit for Approval' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

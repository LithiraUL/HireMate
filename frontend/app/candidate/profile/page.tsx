'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { candidateService } from '@/lib/candidateService';
import api from '@/lib/api';
import { Candidate } from '@/types';
import Loading from '@/components/Loading';
import { FiUpload, FiGithub, FiLinkedin, FiSave } from 'react-icons/fi';

export default function CandidateProfile() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<Partial<Candidate>>({
    name: '',
    email: '',
    age: undefined,
    skills: [],
    cvUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    jobPreferences: {
      employmentType: 'both',
      workMode: 'any',
    },
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'candidate')) {
      router.push('/login');
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  const loadProfile = async () => {
    try {
      // Fetch current user profile from /users/profile endpoint
      const response = await api.get('/users/profile');
      const userData = response.data.user;
      
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        age: userData.age || undefined,
        skills: userData.skills || [],
        cvUrl: userData.cvUrl || '',
        githubUrl: userData.githubUrl || '',
        linkedinUrl: userData.linkedinUrl || '',
        jobPreferences: userData.jobPreferences || {
          employmentType: 'both',
          workMode: 'any',
        },
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('jobPreferences.')) {
      const prefKey = name.split('.')[1];
      setProfile({
        ...profile,
        jobPreferences: {
          ...profile.jobPreferences!,
          [prefKey]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value,
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Confirm before uploading
    const confirmed = confirm(
      `Upload "${file.name}"?\n\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nThis will replace your current CV.`
    );
    
    if (!confirmed) {
      e.target.value = ''; // Reset file input
      return;
    }

    setUploading(true);
    try {
      const response = await candidateService.uploadCV(file);
      setProfile({ ...profile, cvUrl: response.url });
      alert('✅ CV uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload CV. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills?.includes(skillInput.trim())) {
      setProfile({
        ...profile,
        skills: [...(profile.skills || []), skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills?.filter((s) => s !== skill) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = await candidateService.updateProfile(profile);
      updateUser(updatedProfile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Update your information and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={profile.age || ''}
                    onChange={handleChange}
                    className="input-field"
                    min="18"
                    max="70"
                  />
                </div>
              </div>
            </div>

            {/* CV Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resume / CV</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {profile.cvUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-green-600 font-medium">CV Uploaded Successfully</p>
                    <a
                      href={profile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View CV
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500 mb-2">No CV uploaded</p>
                )}
                <label className="btn-primary mt-4 inline-flex items-center cursor-pointer">
                  <FiUpload className="mr-2" />
                  {uploading ? 'Uploading...' : profile.cvUrl ? 'Replace CV' : 'Upload CV'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PDF, DOC, or Image (Max 10MB)</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Skills</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="input-field flex-1"
                  placeholder="Add a skill (e.g., JavaScript, React)"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-primary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="badge bg-primary-100 text-primary-700 flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-primary-900 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* External Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiGithub className="inline mr-2" />
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={profile.githubUrl || ''}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiLinkedin className="inline mr-2" />
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={profile.linkedinUrl || ''}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>
              </div>
            </div>

            {/* Job Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Job Preferences</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    name="jobPreferences.employmentType"
                    value={profile.jobPreferences?.employmentType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="full-time">Full-time only</option>
                    <option value="part-time">Part-time only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Mode
                  </label>
                  <select
                    name="jobPreferences.workMode"
                    value={profile.jobPreferences?.workMode}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="onsite">Onsite only</option>
                    <option value="remote">Remote only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center disabled:opacity-50"
              >
                <FiSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

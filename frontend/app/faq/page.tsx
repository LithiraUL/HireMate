'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FAQ {
  question: string;
  answer: string;
  category: 'general' | 'candidate' | 'employer';
}

const faqs: FAQ[] = [
  {
    category: 'general',
    question: 'What is HireMate?',
    answer: 'HireMate is an AI-powered recruitment management system designed specifically for small and medium enterprises (SMEs) in Sri Lanka. It helps employers find the right candidates and job seekers discover opportunities that match their skills and preferences.'
  },
  {
    category: 'general',
    question: 'Is HireMate free to use?',
    answer: 'Yes! HireMate is currently free for both candidates and employers as part of our academic project at the University of Moratuwa.'
  },
  {
    category: 'candidate',
    question: 'How do I create a candidate profile?',
    answer: 'Click on "Sign Up" and select "I\'m looking for a job". Fill in your details including skills, experience, education, and upload your CV. Make sure to set your job preferences for better matches.'
  },
  {
    category: 'candidate',
    question: 'Can I apply to multiple jobs?',
    answer: 'Yes! You can apply to as many jobs as you want. Each application is tracked separately in your "My Applications" section where you can monitor their status.'
  },
  {
    category: 'candidate',
    question: 'How do I update my CV?',
    answer: 'Go to your Profile page and click on "Edit Profile". You can upload a new CV in PDF format which will replace your existing one.'
  },
  {
    category: 'candidate',
    question: 'What does application status mean?',
    answer: 'Application statuses include: Pending (under review), Reviewed (employer has seen it), Shortlisted (you\'re in the final round), Rejected (not selected), and Accepted (congratulations!).'
  },
  {
    category: 'employer',
    question: 'How do I post a job?',
    answer: 'After signing up as an employer, navigate to "Post Job" from your dashboard. Fill in job details including title, description, required skills, salary range, and work mode. Your job will be visible to candidates immediately.'
  },
  {
    category: 'employer',
    question: 'How does candidate matching work?',
    answer: 'Our AI system matches candidates based on their skills, experience level, age, employment preferences (full-time/part-time), and work mode preferences (remote/onsite/hybrid) with your job requirements.'
  },
  {
    category: 'employer',
    question: 'Can I edit or delete posted jobs?',
    answer: 'Yes! Go to "My Jobs" to see all your postings. You can edit job details, change status (open/closed), or delete jobs. Note that deleting a job will also remove all associated applications.'
  },
  {
    category: 'employer',
    question: 'How do I schedule interviews?',
    answer: 'From your job\'s applications list, click on a shortlisted candidate and select "Schedule Interview". You can set the date, time, type (in-person/video), and add meeting details.'
  },
  {
    category: 'employer',
    question: 'What is the difference between "Find Candidates" and "My Jobs"?',
    answer: '"Applicants" shows only candidates who have applied to your jobs with filtering options. "My Jobs" displays all your posted jobs with application counts and management options.'
  },
  {
    category: 'general',
    question: 'Is my data secure?',
    answer: 'Yes! We use industry-standard security practices including encrypted passwords, secure file storage with Cloudinary, and JWT-based authentication. Your personal information is never shared without consent.'
  },
  {
    category: 'general',
    question: 'Can I use HireMate on mobile?',
    answer: 'Yes! HireMate is fully responsive and works on all devices including smartphones and tablets. The interface adapts to your screen size for optimal experience.'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'candidate' | 'employer'>('all');

  const filteredFAQs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about HireMate
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setActiveCategory('general')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === 'general'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveCategory('candidate')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === 'candidate'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            For Candidates
          </button>
          <button
            onClick={() => setActiveCategory('employer')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === 'employer'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            For Employers
          </button>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <FiChevronUp className="text-primary-600 flex-shrink-0 ml-4" />
                ) : (
                  <FiChevronDown className="text-gray-400 flex-shrink-0 ml-4" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 bg-primary-600 rounded-lg shadow-md p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6">
            Can't find the answer you're looking for? Please contact our support team.
          </p>
          <a href="/contact" className="btn-secondary">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

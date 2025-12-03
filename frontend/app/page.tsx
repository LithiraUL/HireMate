import Link from 'next/link';
import { FiBriefcase } from 'react-icons/fi';
import { FiUsers } from 'react-icons/fi';
import { FiTrendingUp } from 'react-icons/fi';
import { FiCheckCircle } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Hiring for <span className="text-primary-600">Sri Lankan SMEs</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered recruitment platform that simplifies hiring with intelligent candidate matching,
            CV validation, and automated workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=candidate" className="btn-primary text-lg px-8 py-3">
              I'm Looking for a Job
            </Link>
            <Link href="/register?role=employer" className="btn-secondary text-lg px-8 py-3">
              I'm Hiring Talent
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose HireMate?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBriefcase className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Job Matching</h3>
              <p className="text-gray-600">
                AI-powered algorithms match candidates with jobs based on skills, experience, and
                preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">CV Validation</h3>
              <p className="text-gray-600">
                Automatically verify candidate skills through GitHub and LinkedIn profile analysis.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Track hiring metrics, time-to-hire, and applicant demographics with detailed dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Candidates */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">For Job Seekers</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FiCheckCircle className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <span>Create a professional profile and upload your CV</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <span>Browse jobs matching your skills and preferences</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <span>Track application status in real-time</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <span>Manage interview invitations seamlessly</span>
                </li>
              </ul>
              <Link href="/register?role=candidate" className="btn-primary mt-6 inline-block">
                Get Started as Candidate
              </Link>
            </div>
            <div className="bg-primary-100 rounded-lg p-8 h-64 flex items-center justify-center">
              <FiUsers className="text-primary-600 text-9xl" />
            </div>
          </div>
        </div>
      </section>

      {/* For Employers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-primary-100 rounded-lg p-8 h-64 flex items-center justify-center order-2 md:order-1">
              <FiBriefcase className="text-primary-600 text-9xl" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">For Employers</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FiCheckCircle className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <span>Post jobs with detailed requirements</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <span>Filter candidates by skills, age, and preferences</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <span>Get AI-powered candidate rankings</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <span>Schedule interviews with automated email notifications</span>
                </li>
              </ul>
              <Link href="/register?role=employer" className="btn-primary mt-6 inline-block">
                Get Started as Employer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-primary-100 text-lg mb-8">
            Join hundreds of SMEs and job seekers already using HireMate
          </p>
          <Link href="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            Sign Up Free
          </Link>
        </div>
      </section>
    </div>
  );
}

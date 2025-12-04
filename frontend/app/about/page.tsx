'use client';

import { FiTarget, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About HireMate</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering SMEs in Sri Lanka with intelligent recruitment solutions
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <FiTarget className="text-4xl text-primary-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700">
              To revolutionize the recruitment process for small and medium enterprises in Sri Lanka 
              by providing an AI-powered platform that simplifies hiring, reduces time-to-hire, and 
              matches the right talent with the right opportunities.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <FiTrendingUp className="text-4xl text-primary-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700">
              To become the leading recruitment management system for SMEs across Sri Lanka, 
              democratizing access to advanced hiring technology and creating a more efficient 
              job market that benefits both employers and job seekers.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose HireMate?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <FiUsers className="text-5xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                AI-powered candidate matching based on skills, experience, and job preferences
              </p>
            </div>
            <div className="text-center">
              <FiAward className="text-5xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Intuitive interface designed specifically for SMEs with limited HR resources
              </p>
            </div>
            <div className="text-center">
              <FiTrendingUp className="text-5xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cost Effective</h3>
              <p className="text-gray-600">
                Affordable solution that reduces recruitment costs and time significantly
              </p>
            </div>
          </div>
        </div>

        {/* About Team */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-md p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">University Project</h2>
          <p className="text-lg max-w-3xl mx-auto">
            HireMate is developed as part of an academic project at the University of Moratuwa, 
            focusing on solving real-world recruitment challenges faced by Sri Lankan SMEs through 
            innovative technology and user-centered design.
          </p>
        </div>
      </div>
    </div>
  );
}

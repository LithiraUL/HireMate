'use client';

import { FiShield, FiLock, FiEye, FiFileText } from 'react-icons/fi';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <FiShield className="text-6xl text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: December 4, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              HireMate ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              recruitment management platform. This is an academic project developed at the University of Moratuwa.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center mb-4">
              <FiFileText className="text-3xl text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Name, email address, and contact information</li>
              <li>Age and demographic information</li>
              <li>Professional information (skills, experience, education)</li>
              <li>Resume/CV files</li>
              <li>Company information (for employers)</li>
              <li>Profile pictures and social media links (GitHub, LinkedIn)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Usage Data</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Job search queries and application history</li>
              <li>Job posting and candidate browsing activity</li>
              <li>Interview scheduling and communication</li>
              <li>Login timestamps and IP addresses</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <div className="flex items-center mb-4">
              <FiEye className="text-3xl text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>To provide and maintain our recruitment services</li>
              <li>To match candidates with suitable job opportunities</li>
              <li>To facilitate communication between employers and candidates</li>
              <li>To send notifications about applications, interviews, and platform updates</li>
              <li>To improve our AI matching algorithms and platform features</li>
              <li>To analyze usage patterns for academic research purposes</li>
              <li>To ensure platform security and prevent fraud</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center mb-4">
              <FiLock className="text-3xl text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Password encryption using bcrypt hashing</li>
              <li>JWT-based authentication for secure sessions</li>
              <li>Secure file storage using Cloudinary</li>
              <li>HTTPS encryption for data transmission</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and role-based permissions</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share your data only in these circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>With Employers:</strong> When you apply to a job, your profile and CV are shared with the employer</li>
              <li><strong>Service Providers:</strong> Third-party services like Cloudinary (file storage) and MongoDB Atlas (database)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Academic Research:</strong> Anonymized data may be used for research at University of Moratuwa</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access and download your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Withdraw applications and remove CVs</li>
              <li>Opt-out of non-essential communications</li>
              <li>Request data portability</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and local storage to maintain your login session and remember your preferences. 
              You can disable cookies in your browser settings, but this may affect platform functionality.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. 
              When you delete your account, we remove your personal data within 30 days, except where required 
              for legal compliance or academic research (anonymized).
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              HireMate is not intended for users under 18 years of age. We do not knowingly collect information 
              from children. If you believe a child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "Last updated" date. Continued use of the platform 
              after changes constitutes acceptance.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or your data, please contact us:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li><strong>Email:</strong> poseidon2002nov@gmail.com</li>
              <li><strong>Phone:</strong> +94 71 278 1444</li>
              <li><strong>Address:</strong> University of Moratuwa, Bandaranayake Mawatha, Moratuwa, Sri Lanka</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

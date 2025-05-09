import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
        
        <div className="bg-base-100 rounded-lg shadow-lg p-8 space-y-6">
          <section className="space-y-4">
            <p className="text-base-content/80">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">1.1 Personal Information</h3>
                  <p className="text-base-content/80">We collect information that you provide directly to us, including:</p>
                  <ul className="list-disc pl-6 text-base-content/80 space-y-2">
                    <li>Name and contact information</li>
                    <li>Student ID and college/university affiliation</li>
                    <li>Profile information and preferences</li>
                    <li>Transaction and payment information</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                <p className="text-base-content/80">We use the collected information to:</p>
                <ul className="list-disc pl-6 text-base-content/80 space-y-2">
                  <li>Provide and maintain our services</li>
                  <li>Process your transactions</li>
                  <li>Verify your student status</li>
                  <li>Communicate with you about our services</li>
                  <li>Ensure platform security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                <p className="text-base-content/80">We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc pl-6 text-base-content/80 space-y-2">
                  <li>Other users (limited to necessary transaction information)</li>
                  <li>Service providers who assist in platform operations</li>
                  <li>Law enforcement when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                <p className="text-base-content/80">
                  We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure. We strive to protect your data but cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                <p className="text-base-content/80">You have the right to:</p>
                <ul className="list-disc pl-6 text-base-content/80 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
                <p className="text-base-content/80">
                  If you have questions about this Privacy Policy, please contact us at:
                  <br />
                  Email: privacy@campuscart.com
                  <br />
                  Address: Campus Hub, University Ave
                </p>
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 
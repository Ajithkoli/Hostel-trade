import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">Terms & Conditions</h1>
        
        <div className="bg-base-100 rounded-lg shadow-lg p-8 space-y-6">
          <section className="space-y-4">
            <p className="text-base-content/80">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-base-content/80">
                  By accessing and using CampusCart, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
                <div className="space-y-3">
                  <p className="text-base-content/80">To use CampusCart, you must:</p>
                  <ul className="list-disc pl-6 text-base-content/80 space-y-2">
                    <li>Be a currently enrolled student at a recognized college/university</li>
                    <li>Be at least 18 years old</li>
                    <li>Provide valid student identification</li>
                    <li>Maintain an active college/university email address</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
                <p className="text-base-content/80">Users agree to:</p>
                <ul className="list-disc pl-6 text-base-content/80 space-y-2">
                  <li>Provide accurate and truthful information</li>
                  <li>Not engage in fraudulent activities</li>
                  <li>Not sell prohibited items</li>
                  <li>Respect other users' privacy and rights</li>
                  <li>Follow all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Prohibited Items</h2>
                <p className="text-base-content/80">The following items are prohibited:</p>
                <ul className="list-disc pl-6 text-base-content/80 space-y-2">
                  <li>Illegal goods or services</li>
                  <li>Weapons and dangerous materials</li>
                  <li>Counterfeit or stolen items</li>
                  <li>Explicit or inappropriate content</li>
                  <li>Academic cheating materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Transactions</h2>
                <div className="space-y-3">
                  <p className="text-base-content/80">Users understand that:</p>
                  <ul className="list-disc pl-6 text-base-content/80 space-y-2">
                    <li>CampusCart is a platform facilitating student-to-student transactions</li>
                    <li>Users are responsible for the accuracy of their listings</li>
                    <li>All transactions should be completed through our platform</li>
                    <li>CampusCart is not responsible for external payment arrangements</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Account Termination</h2>
                <p className="text-base-content/80">
                  CampusCart reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm the community in any way.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Modifications to Terms</h2>
                <p className="text-base-content/80">
                  We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                <p className="text-base-content/80">
                  For questions about these terms, please contact us at:
                  <br />
                  Email: legal@campuscart.com
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
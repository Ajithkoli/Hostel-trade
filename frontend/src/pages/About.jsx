import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">About CampusCart</h1>
        
        <div className="bg-base-100 rounded-lg shadow-lg p-8 space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="text-base-content/80 leading-relaxed">
              CampusCart is dedicated to revolutionizing campus commerce by creating a secure and efficient marketplace exclusively for college students. We aim to make student life easier by providing a platform where students can buy, sell, and exchange items within their campus community.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Secure Trading</h3>
                <p className="text-base-content/80">Verified student accounts and secure transaction systems ensure safe trading within the campus community.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Easy Navigation</h3>
                <p className="text-base-content/80">User-friendly interface designed specifically for quick and efficient campus trading.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Community Focus</h3>
                <p className="text-base-content/80">Built exclusively for college students, fostering a trusted community marketplace.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Smart Categories</h3>
                <p className="text-base-content/80">Organized categories tailored to student needs, from textbooks to electronics.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Story</h2>
            <p className="text-base-content/80 leading-relaxed">
              Founded by students who understood the challenges of campus life, CampusCart began as a solution to simplify buying and selling within college communities. What started as a simple idea has grown into a comprehensive platform that serves thousands of students, making campus commerce more accessible and efficient than ever before.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Join Our Community</h2>
            <p className="text-base-content/80 leading-relaxed">
              Whether you're looking to sell unused textbooks, find affordable electronics, or connect with fellow students for trading, CampusCart is your go-to platform. Join our growing community and experience a new way of campus trading.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 
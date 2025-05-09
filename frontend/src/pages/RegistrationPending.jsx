import React from 'react';
import { Link } from 'react-router-dom';
import { FaHourglassHalf } from 'react-icons/fa';
import AuthLayout from './AuthLayout';

export default function RegistrationPending() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <FaHourglassHalf className="text-6xl text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Registration Pending
        </h2>
        <p className="text-gray-600 mb-6">
          Your account registration is pending admin approval. You will be able to login once your account is verified.
        </p>
        <div className="space-y-4">
          <Link
            to="/login"
            className="btn btn-primary w-full"
          >
            Go to Login
          </Link>
          <Link
            to="/"
            className="btn btn-outline w-full"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
} 
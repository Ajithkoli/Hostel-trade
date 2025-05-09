import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-primary-light to-primary py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Welcome to CampusCart
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Your trusted platform for campus commerce. Buy, sell, and trade with your fellow students.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/marketplace"
              className="btn btn-accent text-text-primary font-semibold px-8 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              Browse Marketplace
            </Link>
            <Link
              to="/register"
              className="btn bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

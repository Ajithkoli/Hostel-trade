import { Link } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-[#212121] text-3xl font-bold mb-2">{title}</h1>
            <p className="text-[#212121]/70">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

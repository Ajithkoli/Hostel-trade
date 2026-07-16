import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { googleOAuthLogin } from "../store/authSlice";
import { FaGoogle, FaQuestionCircle, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

export default function OAuthButtons() {
  const dispatch = useDispatch();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [customProfile, setCustomProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@campuscart.com",
    picture: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
  });

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Dynamically load Google GSI script if Client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    const loadGsi = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogle();
        document.body.appendChild(script);
      } else {
        initGoogle();
      }
    };

    const initGoogle = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
        });

        const btnContainer = document.getElementById("google-official-btn");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
          });
        }
      } catch (err) {
        console.error("Failed to initialize Google Sign-In:", err);
      }
    };

    loadGsi();
  }, [googleClientId]);

  const handleGoogleResponse = (response) => {
    dispatch(googleOAuthLogin({ credential: response.credential }))
      .unwrap()
      .then(() => toast.success("Successfully signed in with Google!"))
      .catch((err) => toast.error(err || "Google Authentication failed."));
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    const demoPayload = {
      isDemo: true,
      profile: {
        ...customProfile,
        googleId: "google-demo-id-12345",
      },
    };

    dispatch(googleOAuthLogin(demoPayload))
      .unwrap()
      .then(() => {
        toast.success("Successfully simulated Google login!");
        setShowDemoModal(false);
      })
      .catch((err) => toast.error(err || "Simulation failed."));
  };

  const selectPreset = (name, email, picture) => {
    setCustomProfile({ name, email, picture });
  };

  return (
    <div className="mt-6">
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-gray-300 w-full"></div>
        <span className="absolute bg-white px-3 text-xs text-gray-500 uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      <div className="w-full">
        {/* Google Sign-in Trigger */}
        {googleClientId ? (
          <div id="google-official-btn" className="w-full flex justify-center h-[44px]"></div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDemoModal(true)}
            className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-50 bg-white font-medium flex items-center justify-center gap-2 h-[44px] transition-colors w-full"
          >
            <FaGoogle className="text-red-500 text-lg" />
            <span>Google (Demo)</span>
          </button>
        )}
      </div>

      {/* Demo Mode Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaQuestionCircle className="text-xl" />
                <h3 className="font-bold text-lg">Google OAuth Demo Mode</h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleDemoSubmit} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                You clicked <strong>Google Sign-In</strong>.
                No client ID was found in your environment variables, so demo mode is active.
              </p>

              {/* Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Select a test profile
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      selectPreset(
                        "Demo Student",
                        "student@campuscart.com",
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      )
                    }
                    className={`p-2.5 border rounded-lg text-left text-xs transition-all ${
                      customProfile.email === "student@campuscart.com"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    Demo Student
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      selectPreset(
                        "System Admin",
                        "admin@campuscart.com",
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
                      )
                    }
                    className={`p-2.5 border rounded-lg text-left text-xs transition-all ${
                      customProfile.email === "admin@campuscart.com"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    System Admin
                  </button>
                </div>
              </div>

              {/* Custom input fields */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Or customize profile details
                </label>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={customProfile.name}
                    onChange={(e) => setCustomProfile({ ...customProfile, name: e.target.value })}
                    className="input input-bordered w-full input-sm text-gray-800 bg-white border-gray-300 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={customProfile.email}
                    onChange={(e) => setCustomProfile({ ...customProfile, email: e.target.value })}
                    className="input input-bordered w-full input-sm text-gray-800 bg-white border-gray-300 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2 justify-end border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(false)}
                  className="btn btn-ghost btn-sm text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-none text-white btn-sm"
                >
                  Simulate Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

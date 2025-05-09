import Chat from "../components/Chat";
import { useSelector } from "react-redux";
import { useLocation, Navigate } from "react-router-dom";

export default function ChatPage() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Extract receiver ID from query params
  const searchParams = new URLSearchParams(location.search);
  const otherUserId = searchParams.get("receiver");

  // If user not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If no otherUserId provided, show error
  if (!otherUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <p className="text-red-500 text-xl">No receiver selected for chat.</p>
      </div>
    );
  }

  const userId = user._id;
  const conversationId = [userId, otherUserId].sort().join("-");

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <Chat
        conversationId={conversationId}
        userId={userId}
        otherUserId={otherUserId}
      />
    </div>
  );
}

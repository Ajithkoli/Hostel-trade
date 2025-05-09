import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function ChatListPage() {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get(`/api/conversations/${user._id}`);
        setConversations(data);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Your Conversations</h1>
        {conversations.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          <div className="grid gap-4">
            {conversations.map((c) => {
              const otherUser = c.participants.find((p) => p._id !== user._id);
              return (
                <Link
                  to={`/chat?receiver=${otherUser._id}`}
                  key={c._id}
                  className="card bg-base-100 shadow-md p-4 hover:bg-base-300 transition"
                >
                  <h2 className="text-xl font-semibold">{otherUser.name}</h2>
                  <p className="text-sm text-gray-500">{otherUser.email}</p>
                  {c.unreadCount > 0 && (
                    <span className="badge badge-error mt-2">
                      {c.unreadCount} new message{c.unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

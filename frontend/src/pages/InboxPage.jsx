import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/api";
import { toast } from "react-toastify";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { HiOutlinePaperAirplane, HiOutlineSearch, HiOutlineArrowLeft } from "react-icons/hi";
import { getImageUrl } from "../utils/image";

export default function InboxPage() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeConv, setActiveConv] = useState(null); // { otherUser, conversationId }
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  // Mobile: show sidebar or chat panel
  const [mobilePanelView, setMobilePanelView] = useState("sidebar"); // "sidebar" | "chat"

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const autoOpenedForRef = useRef(null); // prevents auto-open infinite loop

  // ── Redirect to login if unauthenticated ───────────────
  if (!user) return <Navigate to="/login" />;

  // ── Auto-open a conversation from ?receiver=... param ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const receiverId = params.get("receiver");
    // Guard: only open once per unique receiverId to prevent infinite loop
    if (!receiverId || conversations.length === 0) return;
    if (autoOpenedForRef.current === receiverId) return;

    const match = conversations.find((c) =>
      c.participants.some((p) => p._id === receiverId)
    );
    if (match) {
      autoOpenedForRef.current = receiverId; // mark as handled before opening
      const otherUser = match.participants.find((p) => p._id !== user._id);
      openConversation(otherUser, [user._id, receiverId].sort().join("-"));
    }
  }, [location.search, conversations]);

  // ── Fetch conversations list ───────────────────────────
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get(`/api/conversations/${user._id}`);
        setConversations(data);
      } catch (err) {
        toast.error("Failed to load conversations");
      } finally {
        setConvLoading(false);
      }
    };
    fetchConversations();
  }, [user._id]);

  // ── Socket setup ───────────────────────────────────────
  useEffect(() => {
    const envUrl = import.meta.env.VITE_SERVER_URL;
    let socketUrl;
    if (envUrl) {
      socketUrl = envUrl;
    } else {
      const apiHostname =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? "localhost"
          : window.location.hostname;
      socketUrl = `http://${apiHostname}:5000`;
    }

    socketRef.current = io(socketUrl, { withCredentials: true });
    const socket = socketRef.current;

    socket.emit("registerUser", user._id);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Mark read if receiver is me and chat is open
      if (
        activeConvRef.current &&
        (msg.receiver === user._id || msg.receiver?._id === user._id)
      ) {
        socket.emit("markAsRead", {
          conversationId: activeConvRef.current.conversationId,
          userId: user._id,
        });
      }
      // Bump conversation to top in sidebar
      setConversations((prev) => {
        const convId = msg.conversationId || activeConvRef.current?.conversationId;
        if (!convId) return prev;
        const idx = prev.findIndex((c) => c._id === convId);
        if (idx === -1) return prev;
        const updated = [prev[idx], ...prev.slice(0, idx), ...prev.slice(idx + 1)];
        return updated;
      });
    });

    socket.on("messagesRead", ({ readerId }) => {
      setMessages((prev) =>
        prev.map((m) => {
          const senderId = m.sender?._id || m.sender;
          return senderId === user._id && readerId !== user._id
            ? { ...m, read: true }
            : m;
        })
      );
    });

    socket.on("typingStatus", ({ userId: typingUserId, isTyping }) => {
      if (activeConvRef.current && typingUserId === activeConvRef.current.otherUser._id) {
        setIsOtherTyping(isTyping);
      }
    });

    socket.on("onlineUsersList", (list) => setOnlineUsers(list));
    socket.on("errorMessage", (msg) => toast.error(msg));

    return () => socket.disconnect();
  }, [user._id]);

  // Ref to track active conversation inside socket closure
  const activeConvRef = useRef(activeConv);
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // ── Open a conversation ────────────────────────────────
  const openConversation = useCallback(
    async (otherUser, conversationId) => {
      if (socketRef.current) {
        if (activeConvRef.current) {
          socketRef.current.emit("leaveConversation", activeConvRef.current.conversationId);
        }
        socketRef.current.emit("joinConversation", conversationId);
      }

      setActiveConv({ otherUser, conversationId });
      setMessages([]);
      setIsOtherTyping(false);
      setMobilePanelView("chat");

      try {
        const { data } = await api.get(
          `/api/chat/conversation/${conversationId}`
        );
        setMessages(data);
        await api.patch(
          `/api/chat/conversation/${conversationId}/read`,
          {}
        );
        if (socketRef.current) {
          socketRef.current.emit("markAsRead", { conversationId, userId: user._id });
        }
        // Reset unread count in sidebar
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch {
        toast.error("Failed to load messages");
      }
    },
    [user._id]
  );

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  // ── Typing ─────────────────────────────────────────────
  const handleInputChange = (e) => {
    setMsgInput(e.target.value);
    if (!activeConv || !socketRef.current) return;
    socketRef.current.emit("typing", {
      conversationId: activeConv.conversationId,
      userId: user._id,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", {
        conversationId: activeConv.conversationId,
        userId: user._id,
      });
    }, 2000);
  };

  // ── Send Message ───────────────────────────────────────
  const handleSend = () => {
    if (!msgInput.trim() || !activeConv || !socketRef.current) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit("stopTyping", {
      conversationId: activeConv.conversationId,
      userId: user._id,
    });
    socketRef.current.emit("chatMessage", {
      conversationId: activeConv.conversationId,
      sender: user._id,
      receiver: activeConv.otherUser._id,
      message: msgInput.trim(),
    });
    setMsgInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filtered sidebar list ─────────────────────────────
  const filteredConvs = conversations.filter((c) => {
    const other = c.participants?.find((p) => p._id !== user._id);
    if (!other) return false;
    return other.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ── Helpers ────────────────────────────────────────────
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const isOnline = (uid) => onlineUsers.includes(uid);

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-64px)] bg-base-200 overflow-hidden">

      {/* ─── LEFT SIDEBAR ─── */}
      <aside
        className={`
          w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-base-100 border-r border-base-300
          ${mobilePanelView === "chat" ? "hidden md:flex" : "flex"}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-base-300 bg-base-100">
          <h1 className="text-xl font-bold text-base-content mb-3">Messages</h1>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input input-sm input-bordered w-full pl-9 rounded-full bg-base-200 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {convLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-16 text-base-content/50 px-4">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-sm font-medium">
                {searchQuery ? "No results found" : "No conversations yet"}
              </p>
              <p className="text-xs mt-1">
                {!searchQuery && "Browse the marketplace and contact a seller!"}
              </p>
            </div>
          ) : (
            filteredConvs.map((c) => {
              const other = c.participants?.find((p) => p._id !== user._id);
              if (!other) return null;
              const convId = [user._id, other._id].sort().join("-");
              const isActive = activeConv?.conversationId === convId;
              const online = isOnline(other._id);

              return (
                <button
                  key={c._id}
                  onClick={() => openConversation(other, convId)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-base-200
                    ${isActive ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-base-200"}
                  `}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-base-300 border-2 border-base-200">
                      {other.profilePicture ? (
                        <img
                          src={getImageUrl(other.profilePicture)}
                          alt={other.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary bg-primary/10">
                          {other.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-base-100 rounded-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className={`font-semibold text-sm truncate ${isActive ? "text-primary" : "text-base-content"}`}>
                        {other.name}
                      </span>
                      <span className="text-[10px] text-base-content/40 flex-shrink-0 ml-1">
                        {formatTime(c.lastMessageAt || c.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-base-content/50 truncate">
                        {other.hostel ? `🏠 ${other.hostel}` : other.email}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="badge badge-primary badge-xs text-[10px] px-1.5 min-w-[1.2rem] flex-shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ─── RIGHT CHAT PANEL ─── */}
      <main
        className={`
          flex-1 flex flex-col overflow-hidden
          ${mobilePanelView === "sidebar" ? "hidden md:flex" : "flex"}
        `}
      >
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-base-100 border-b border-base-300 shadow-sm">
              {/* Mobile back button */}
              <button
                className="btn btn-ghost btn-sm btn-circle md:hidden"
                onClick={() => setMobilePanelView("sidebar")}
              >
                <HiOutlineArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-base-300">
                  {activeConv.otherUser.profilePicture ? (
                    <img
                      src={getImageUrl(activeConv.otherUser.profilePicture)}
                      alt={activeConv.otherUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/10">
                      {activeConv.otherUser.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                {isOnline(activeConv.otherUser._id) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-2 border-base-100 rounded-full" />
                )}
              </div>

              <div>
                <h2 className="font-bold text-base leading-tight">
                  {activeConv.otherUser.name}
                </h2>
                <p className="text-xs text-base-content/50">
                  {isOtherTyping
                    ? "typing..."
                    : isOnline(activeConv.otherUser._id)
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 bg-base-200/50">
              {messages.map((msg) => {
                const senderId = msg.sender?._id || msg.sender;
                const isMe = senderId === user._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                        max-w-[70%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm
                        ${isMe
                          ? "bg-primary text-primary-content rounded-tr-none"
                          : "bg-base-100 text-base-content border border-base-300 rounded-tl-none"
                        }
                      `}
                    >
                      <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                      <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMe ? "justify-end opacity-70" : "justify-end opacity-50"}`}>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && (
                          msg.read
                            ? <FaCheckDouble className="w-2.5 h-2.5" />
                            : <FaCheck className="w-2.5 h-2.5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing bubble */}
              {isOtherTyping && (
                <div className="flex justify-start">
                  <div className="bg-base-100 border border-base-300 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1 shadow-sm">
                    <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-base-100 border-t border-base-300">
              <input
                type="text"
                className="input input-bordered flex-1 rounded-full focus:outline-none focus:border-primary"
                placeholder="Type a message..."
                value={msgInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn btn-primary btn-circle shadow-md"
                onClick={handleSend}
                disabled={!msgInput.trim()}
              >
                <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
              </button>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center text-base-content/40 px-8 bg-base-200/50">
            <div className="text-7xl mb-4">💬</div>
            <h2 className="text-xl font-semibold mb-2 text-base-content/60">
              Select a conversation
            </h2>
            <p className="text-sm max-w-xs">
              Choose a contact from the left to open the chat.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

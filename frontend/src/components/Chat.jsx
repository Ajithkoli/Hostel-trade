import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheck, FaCheckDouble } from "react-icons/fa";

export default function Chat({ conversationId, userId, otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]);

  // Connect Sockets & Listeners
  useEffect(() => {
    const envUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
    const socketUrl = (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1")
      ? envUrl.replace("localhost", window.location.hostname).replace("127.0.0.1", window.location.hostname)
      : envUrl;

    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Register active user ID
    socket.emit("registerUser", userId);
    socket.emit("joinConversation", conversationId);

    // Socket: New incoming message
    socket.on("newMessage", (msg) => {
      setMessages((prev) => {
        // Prevent duplicate append
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Mark as read if user is the receiver and has conversation open
      if (msg.receiver === userId || msg.receiver?._id === userId) {
        socket.emit("markAsRead", { conversationId, userId });
      }
    });

    // Socket: Unread messages list marked as read by other user
    socket.on("messagesRead", ({ readerId }) => {
      if (readerId === otherUserId) {
        setMessages((prev) =>
          prev.map((m) => {
            const senderId = m.sender?._id || m.sender;
            return senderId === userId ? { ...m, read: true } : m;
          })
        );
      }
    });

    // Socket: Typing indicators status updates
    socket.on("typingStatus", ({ userId: typingUserId, isTyping }) => {
      if (typingUserId === otherUserId) {
        setIsOtherTyping(isTyping);
      }
    });

    // Socket: Online status mapping list
    socket.on("onlineUsersList", (usersList) => {
      setOnlineUsers(usersList);
    });

    socket.on("errorMessage", (msg) => {
      toast.error(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, userId, otherUserId]);

  // Fetch Legacy and Existing Messages from REST API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/chat/conversation/${conversationId}`, {
          withCredentials: true,
        });
        setMessages(data);
        
        // Sync unread status on loading conversation
        await axios.patch(`/api/chat/conversation/${conversationId}/read`, {}, { withCredentials: true });
        
        // Notify socket
        if (socketRef.current) {
          socketRef.current.emit("markAsRead", { conversationId, userId });
        }
      } catch (error) {
        toast.error("Failed to fetch conversation history");
      }
    };

    fetchMessages();
  }, [conversationId, userId]);

  // Handle Input typing and indicators
  const handleInputChange = (e) => {
    setMsgInput(e.target.value);
    
    // Emit typing status
    if (socketRef.current) {
      socketRef.current.emit("typing", { conversationId, userId });
    }

    // Debounce stop typing status
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("stopTyping", { conversationId, userId });
      }
    }, 2000);
  };

  const handleSend = () => {
    if (!msgInput.trim()) return;

    // Clear typing timeout and emit stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socketRef.current) {
      socketRef.current.emit("stopTyping", { conversationId, userId });
      
      socketRef.current.emit("chatMessage", {
        conversationId,
        sender: userId,
        receiver: otherUserId,
        message: msgInput.trim(),
      });
    }

    setMsgInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Extract other user's name dynamically from populated messages
  const otherUserMessage = messages.find(
    (m) =>
      (m.sender?._id === otherUserId && m.sender?.name) ||
      (m.receiver?._id === otherUserId && m.receiver?.name)
  );

  const otherUserName = otherUserMessage
    ? otherUserMessage.sender?._id === otherUserId
      ? otherUserMessage.sender?.name
      : otherUserMessage.receiver?.name
    : "User";

  const isOnline = onlineUsers.includes(otherUserId);

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[520px] bg-base-100 shadow-xl rounded-2xl overflow-hidden border border-base-300">
      
      {/* Header bar */}
      <div className="bg-primary text-primary-content p-4 flex justify-between items-center shadow-md">
        <div>
          <h2 className="text-lg font-bold">{otherUserName}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-success animate-pulse" : "bg-gray-400"}`}></span>
            <span className="text-xs font-semibold opacity-90">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Message scroll container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-base-200/50">
        {messages.map((msg) => {
          const msgSenderId = msg.sender?._id || msg.sender;
          const isMe = msgSenderId === userId;
          
          return (
            <div
              key={msg._id}
              className={`flex flex-col max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative transition-all ${
                isMe
                  ? "self-end bg-primary text-primary-content rounded-tr-none"
                  : "self-start bg-base-100 text-base-content rounded-tl-none border border-base-300"
              }`}
            >
              <p className="text-sm break-words leading-relaxed">{msg.message}</p>
              
              <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-[10px] self-end">
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {isMe && (
                  <span>
                    {msg.read ? (
                      <FaCheckDouble className="text-accent-content w-2.5 h-2.5" />
                    ) : (
                      <FaCheck className="text-neutral-content/60 w-2.5 h-2.5" />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {isOtherTyping && (
          <div className="self-start bg-base-100 text-base-content rounded-2xl rounded-tl-none px-4 py-2.5 border border-base-300 shadow-sm flex items-center gap-1">
            <span className="text-xs font-medium text-gray-500 italic">typing</span>
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input footer */}
      <div className="p-4 bg-base-100 border-t border-base-300 flex gap-2 items-center">
        <input
          type="text"
          className="input input-bordered flex-1 focus:input-primary"
          placeholder="Type a message..."
          value={msgInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button className="btn btn-primary shadow-md px-6" onClick={handleSend}>
          Send
        </button>
      </div>

    </div>
  );
}

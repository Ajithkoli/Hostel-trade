import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";

export default function Chat({ conversationId, userId, otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
      withCredentials: true,
    });

    socketRef.current.emit("joinConversation", conversationId);

    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("errorMessage", (msg) => {
      toast.error(msg);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/chat/conversation/${conversationId}`, {
          withCredentials: true,
        });
        setMessages(data);
      } catch {
        toast.error("Failed to fetch chat messages");
      }
    };
    fetchMessages();
  }, [conversationId]);

  const handleSend = () => {
    if (!msgInput.trim()) return;
    socketRef.current.emit("chatMessage", {
      conversationId,
      sender: userId,
      receiver: otherUserId,
      message: msgInput.trim(),
    });
    setMsgInput("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      <div className="h-80 overflow-y-auto flex flex-col gap-2 mb-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`max-w-xs px-3 py-2 rounded-lg ${
              msg.sender === userId ? "self-end bg-blue-600 text-white" : "self-start bg-gray-300"
            }`}
          >
            <p>{msg.message}</p>
            <div className="text-xs text-right">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input input-bordered w-full"
          placeholder="Type a message..."
          value={msgInput}
          onChange={(e) => setMsgInput(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

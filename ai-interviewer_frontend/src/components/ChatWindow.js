import { useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import "./ChatWindow.css";

function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      message: "👋 Hi, I'm your AI Interviewer. Ready for your first question? Type your topic (e.g. JavaScript)",
    },
  ]);
  const [sessionId] = useState(() => Date.now().toString());
  const [waiting, setWaiting] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const sendMessageToBackend = async (text) => {
    if (completed || waiting) return;

    setMessages((prev) => [...prev, { sender: "user", message: text }]);

    if (!started) {
      // First message: topic
      setWaiting(true);
      try {
        const res = await fetch("http://localhost:8000/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, topic: text }),
        });
        const data = await res.json();
        if (data.question) {
          setMessages((prev) => [...prev, { sender: "bot", message: data.question }]);
          setStarted(true);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", message: "❌ Error: Couldn't get a question." },
          ]);
        }
      } catch (err) {
        setMessages((prev) => [...prev, { sender: "bot", message: "🚨 Server error." }]);
      }
      setWaiting(false);
    } else {
      // Subsequent answers
      setWaiting(true);
      try {
        const res = await fetch("http://localhost:8000/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, answer: text }),
        });
        const data = await res.json();

        if (data.feedback && data.next_question) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", message: `📝 Feedback: ${data.feedback}` },
            { sender: "bot", message: data.next_question },
          ]);
        } else if (data.feedback && data.summary) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", message: `📝 Feedback: ${data.feedback}` },
            { sender: "bot", message: `🎉 ${data.summary}` },
          ]);
          setCompleted(true);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", message: "❌ Error: Something went wrong." },
          ]);
        }
      } catch (err) {
        setMessages((prev) => [...prev, { sender: "bot", message: "🚨 Server error." }]);
      }
      setWaiting(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} sender={msg.sender} message={msg.message} />
        ))}
      </div>
      <ChatInput onSend={sendMessageToBackend} disabled={waiting || completed} />
    </div>
  );
}

export default ChatWindow;

import "./MessageBubble.css";

function MessageBubble({ sender, message }) {
  const isUser = sender === "user";

  return (
    <div className={`message-row ${isUser ? "right" : "left"}`}>
      <div className={`message-bubble ${isUser ? "user" : "bot"}`}>{message}</div>
    </div>
  );
}

export default MessageBubble;

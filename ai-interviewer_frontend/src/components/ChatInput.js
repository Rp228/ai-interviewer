import { useState } from "react";
import "./ChatInput.css";

function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        className="chat-text"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={disabled ? "Thinking..." : "Type your answer..."}
        disabled={disabled}
      />
      <button className="chat-button" type="submit" disabled={disabled}>Send</button>
    </form>
  );
}

export default ChatInput;

import React, { useState, useRef, useEffect } from "react";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSenderView, setIsSenderView] = useState(true);
  const [language, setLanguage] = useState("English");
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { id: Date.now(), text: input, isUser: isSenderView }]);
      setInput("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatBox}>
        <div style={styles.header}>
          <button style={isSenderView ? styles.tabActive : styles.tab} onClick={() => setIsSenderView(true)}>
            Sender (English)
          </button>
          <button style={!isSenderView ? styles.tabActive : styles.tab} onClick={() => setIsSenderView(false)}>
            Receiver (French)
          </button>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.dropdown}>
            <option>English</option>
            <option>French</option>
          </select>
        </div>

        <div style={styles.chatWindow} ref={chatWindowRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.message,
                alignSelf: message.isUser === isSenderView ? "flex-end" : "flex-start",
                backgroundColor: message.isUser === isSenderView ? "#007bff" : "#e0e0e0",
                color: message.isUser === isSenderView ? "#fff" : "#000",
              }}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div style={styles.inputContainer}>
          <input
            type="text"
            style={styles.input}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button style={styles.sendButton} onClick={handleSendMessage}>➤</button>
          <button style={styles.clearButton} onClick={() => setMessages([])}>🗑️ Clear Chat</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #E0B3E6, #FAD0C4)",
  },
  chatBox: {
    width: "40vw",
    height: "65vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
  },
  tab: {
    padding: "8px 12px",
    borderRadius: "6px",
    backgroundColor: "#f0f0f0",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  tabActive: {
    padding: "8px 12px",
    borderRadius: "6px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  dropdown: {
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  chatWindow: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
  },
  message: {
    maxWidth: "70%",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "8px",
  },
  inputContainer: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    outline: "none",
  },
  sendButton: {
    marginLeft: "8px",
    padding: "8px 12px",
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  clearButton: {
    marginLeft: "8px",
    padding: "8px 12px",
    backgroundColor: "#ddd",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};

export default ChatBox;

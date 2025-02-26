import React, { useState, useRef, useEffect } from "react";
import { translateText } from "../utils/translate";

type Message = {
  id: number;
  text: string;
  translatedText: string;
  isUser: boolean;
};

const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSenderView, setIsSenderView] = useState(true);
  const [language, setLanguage] = useState("French"); // Default to French
  const chatWindowRef = useRef<HTMLDivElement | null>(null); // ✅ Fixed TypeScript error

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() !== "") {
      const sourceLang = "en"; // Assuming sender types in English
      const targetLang =
        language === "French" ? "fr" :
        language === "Spanish" ? "es" :
        language === "German" ? "de" : "en";

      const newMessage: Message = {
        id: Date.now(),
        text: input,
        translatedText: "Translating...",
        isUser: isSenderView,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput("");

      // Translate message dynamically
      const translatedText = await translateText(input, sourceLang, targetLang);

      // Update translated text in the message list
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, translatedText } : msg
        )
      );
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
            Receiver ({language})
          </button>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.dropdown}>
            <option>French</option>
            <option>Spanish</option>
            <option>German</option>
          </select>
        </div>

        <div style={styles.chatWindow} ref={chatWindowRef}>
          {messages.map((message) => (
            <div key={message.id} style={message.isUser ? styles.userMessage : styles.botMessage}>
              <p>{message.text}</p>  {/* Original Message */}
              <p style={{ fontSize: "12px", fontStyle: "italic", color: "gray" }}>
                {message.translatedText && `Translated: ${message.translatedText}`}
              </p>  {/* Translated Message */}
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

const styles: { [key: string]: React.CSSProperties } = {
  page: { width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(to right, #E0B3E6, #FAD0C4)" },
  chatBox: { width: "40vw", height: "65vh", display: "flex", flexDirection: "column", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#fff", borderBottom: "1px solid #ddd" },
  tab: { padding: "8px 12px", borderRadius: "6px", backgroundColor: "#f0f0f0", border: "none", cursor: "pointer", fontWeight: "bold" },
  tabActive: { padding: "8px 12px", borderRadius: "6px", backgroundColor: "#000", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" },
  dropdown: { padding: "6px", borderRadius: "6px", border: "1px solid #ddd" },
  chatWindow: { flex: 1, overflowY: "auto", padding: "10px" },
  userMessage: { maxWidth: "70%", padding: "10px", borderRadius: "10px", marginBottom: "8px", backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  botMessage: { maxWidth: "70%", padding: "10px", borderRadius: "10px", marginBottom: "8px", backgroundColor: "#F1F0F0", alignSelf: "flex-start" },
  inputContainer: { display: "flex", padding: "10px", borderTop: "1px solid #ddd" },
  input: { flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ddd", outline: "none" },
  sendButton: { marginLeft: "8px", padding: "8px 12px", backgroundColor: "#000", color: "#fff", borderRadius: "6px", border: "none", cursor: "pointer" },
  clearButton: { marginLeft: "8px", padding: "8px 12px", backgroundColor: "#ddd", borderRadius: "6px", border: "none", cursor: "pointer" },
};

export default ChatBox;

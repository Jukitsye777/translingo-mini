import React, { useState, useRef, useEffect } from "react";
import { translateText, supportedLanguages } from "../utils/translate";
import EmojiPicker from "emoji-picker-react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  id: number;
  text: string;
  translatedText: string;
  isUser: boolean;
};

type ChatboxProps = {
  selectedContact: { id: number; name: string };
  goBack: () => void;
  senderLanguage: string; // Add senderLanguage prop
};

const Chatbox: React.FC<ChatboxProps> = ({ selectedContact, goBack, senderLanguage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSenderView, setIsSenderView] = useState(true);
  const [language, setLanguage] = useState("fr");
  const chatWindowRef = useRef<HTMLDivElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleEmojiClick = (emojiObject: any) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const startSpeechToText = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    const sourceLang = isSenderView ? supportedLanguages[senderLanguage] || "en" : language;
    recognition.lang = sourceLang;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
    };
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechToText = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = async () => {
    if (isRecording) stopSpeechToText();

    if (input.trim() !== "") {
      const newMessage: Message = {
        id: Date.now(),
        text: input,
        translatedText: "Translating...",
        isUser: isSenderView,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput("");

      const sourceLang = isSenderView ? supportedLanguages[senderLanguage] || "en" : language;
      const targetLang = isSenderView ? language : supportedLanguages[senderLanguage] || "en";

      // Separate text and emojis
      const emojiRegex = /[\p{Emoji}]/gu;
      const extractedEmojis = input.match(emojiRegex)?.join("") || ""; // Preserve original emojis
      const textWithoutEmojis = input.replace(emojiRegex, "").trim(); // Remove emojis from text

      let finalTranslation;

      if (textWithoutEmojis === "") {
        // If only emojis are present, just send them (no translation)
        finalTranslation = extractedEmojis;
      } else {
        // Translate only the text part
        const translatedText = await translateText(textWithoutEmojis, sourceLang, targetLang);
        finalTranslation = translatedText + " " + extractedEmojis; // Append original emojis
      }

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, translatedText: finalTranslation.trim() }
            : msg
        )
      );
    }
  };
  const clearChat = () => setMessages([]);
  // Function to get language name from language code
  const getLanguageName = (languageCode: string): string => {
    for (const langName in supportedLanguages) {
      if (supportedLanguages[langName] === languageCode) {
        return langName;
      }
    }
    return "Unknown"; // Default if language code is not found
  };
  const senderLanguageName = getLanguageName(supportedLanguages[senderLanguage] || "en");

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100vh",
      minHeight: "100vh",
      background: "linear-gradient(to right, #132666, #3a4d8f)",
      fontFamily: "'Poppins', sans-serif",
      paddingBottom: "20px" // Add padding to the bottom
    }}>
      {/* Back & Clear Chat Buttons */}
      <div style={{ display: "flex", gap: "10px", margin: "10px", paddingTop: "20px" }}>
        <button
          onClick={goBack}
          style={{ padding: "8px 12px", backgroundColor: "#6A95CC", color: "#fff", borderRadius: "6px", cursor: "pointer", border: "none", fontFamily: "'Poppins', sans-serif" }}
        >
          🔙 Back to Contacts
        </button>

        <button
          onClick={clearChat}
          style={{ padding: "8px 12px", backgroundColor: "#6A95CC", color: "#fff", borderRadius: "6px", cursor: "pointer", border: "none", fontFamily: "'Poppins', sans-serif" }}
        >
          🗑 Clear Chat
        </button>
      </div>

      <h2 style={{ color: "white" }}>Chat with {selectedContact.name}</h2>

      {/* Chat Container */}
      <div style={{ flex: 1, width: "90%", display: "flex", flexDirection: "column", backgroundColor: "#fff", borderRadius: "10px", overflow: "hidden" }}>

        {/* Sender, Receiver & Language Buttons */}
        <div style={{
          display: "flex", justifyContent: "space-between", padding: "10px",
          borderBottom: "1px solid #ddd", backgroundColor: "#f5f5f5",
          borderRadius: "10px 10px 0 0"
        }}>
          <button onClick={() => setIsSenderView(true)} style={{
            backgroundColor: isSenderView ? "#4a6edb" : "#fff", color: isSenderView ? "white" : "#000",
            border: "1px solid #ccc", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"
          }}>
            Sender ({senderLanguageName})
          </button>

          <button onClick={() => setIsSenderView(false)} style={{
            backgroundColor: !isSenderView ? "#4a6edb" : "#fff", color: !isSenderView ? "white" : "#000",
            border: "1px solid #ccc", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"
          }}>
            Receiver ({language})
          </button>

          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{
            padding: "8px", borderRadius: "4px", border: "1px solid #ccc",
            fontWeight: "bold", cursor: "pointer"
          }}>
            {Object.keys(supportedLanguages).map((lang) => (
              <option key={lang} value={supportedLanguages[lang]}>{lang}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }} ref={chatWindowRef}>
          {messages.map((message) => {
            const isUserMessage = message.isUser === isSenderView;
            return (
              <div key={message.id} style={{ display: "flex", justifyContent: isUserMessage ? "flex-end" : "flex-start" }}>
                <div style={{
                  width: "60%", padding: "12px", borderRadius: "10px", marginBottom: "8px",
                  backgroundColor: isUserMessage ? "#DCF8C6" : "#F1F0F0"
                }}>
                  <p style={{ fontWeight: "bold" }}>
                    {isUserMessage ? message.text : message.translatedText}
                  </p>
                  <p style={{ color: "gray", fontSize: "14px" }}>
                    {isUserMessage ? message.translatedText : message.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Box & Buttons */}
        <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ddd", alignItems: "center" }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..." style={{
              flex: 1, padding: "12px", border: "1px solid #ccc", fontSize: "16px"
            }} />

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              width: "40px", height: "40px",
              backgroundColor: "#f0f0f0", borderRadius: "6px",
              border: "1px solid #ccc", cursor: "pointer",
              fontSize: "18px", display: "flex",
              alignItems: "center", justifyContent: "center",
              marginRight: "8px",
              marginLeft: "8px" // Add spacing between buttons
            }}>
            😀
          </button>
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div style={{ position: "absolute", bottom: "60px", right: "10px", zIndex: 1000 }}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <button
            onClick={isRecording ? stopSpeechToText : startSpeechToText}
            style={{
              width: "40px", height: "40px",
              borderRadius: "6px", border: isRecording ? "3px solid red" : "1px solid #ccc",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              marginRight: "8px" // Add spacing between buttons
            }}>
            {isRecording ? "🔴" : "🎤"}
          </button>

          <button
            onClick={handleSendMessage}
            style={{
              width: "40px", height: "40px",
              backgroundColor: "#000", color: "#fff",
              borderRadius: "6px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            ➤
          </button>

        </div>

      </div>
    </div>
  );
};

export default Chatbox;

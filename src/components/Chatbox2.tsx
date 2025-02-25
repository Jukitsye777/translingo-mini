

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Send, X, MoreVertical } from "lucide-react"
import TranslationDisplay from "./TranslationDisplay"

export default function ChatSpace() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "user", originalText: "Hello, how are you?", translatedText: "Translated text: Hola, ¿cómo estás?" },
    { id: 2, sender: "other", originalText: "I'm doing well, thank you!", translatedText: "Original text: Estoy bien, ¡gracias!" },
    { id: 3, sender: "user", originalText: "That's great to hear!", translatedText: "Translated text: ¡Me alegro de oírlo!" },
    { id: 4, sender: "other", originalText: "How about you?", translatedText: "Original text: ¿Y tú qué tal?" },
  ])
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [])

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "user",
        originalText: inputText,
        translatedText: "Translation in progress...", // This would be replaced with actual translation
      }
      setMessages([...messages, newMessage])
      setInputText("")
      // Here you would call your translation API
    }
  }

  const startVoiceRecording = () => {
    setIsRecording(true)
    // Implement voice recording logic here
  }

  const stopVoiceRecording = () => {
    setIsRecording(false)
    // Implement stop recording and send voice message logic here
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-r-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
          <div>
            <h2 className="font-bold text-white">John Doe</h2>
            <p className="text-xs text-gray-400">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <TranslationDisplay key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-gray-800">
        <div className="flex items-center space-x-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow bg-gray-700 text-white border-none focus:ring-2 focus:ring-blue-500"
            rows={1}
          />
        
          <Button
            onClick={sendMessage}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Send className="h-5 w-5" />
          </Button>
          <Button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`bg-gradient-to-r ${
              isRecording
                ? "from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                : "from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            }`}
          >
            {isRecording ? <X className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}


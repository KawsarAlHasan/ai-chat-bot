import { useState, useEffect, useRef } from "react";
import grandBot from "../assets/grant-bot.png";
import sendIcon from "../assets/send-icon.png";

function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: "user",
      text: "Can you answer my question?",
      time: "12:46",
    },
    {
      sender: "bot",
      text: "Of course, ask me.",
      time: "12:45",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Ref for auto scroll
  const messagesEndRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString().slice(0, 5),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "This is where information from AI will come in. 😊",
          time: new Date().toLocaleTimeString().slice(0, 5),
        },
      ]);
      setIsTyping(false);
    }, 2000);
  };

  // Auto scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="h-[550px] flex flex-col rounded-lg">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-6 p-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat ${
              msg.sender === "bot" ? "chat-start" : "chat-end"
            }`}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="avatar"
                  src={
                    msg.sender === "bot"
                      ? grandBot
                      : "https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
                  }
                />
              </div>
            </div>
            <div className="chat-header">
              {msg.sender === "bot" ? "Grant Bot" : "User"}
              <time className="text-xs opacity-50 ml-2">{msg.time}</time>
            </div>
            <div
              className={`p-2 ${
                msg.sender === "bot"
                  ? "bg-[#eeeeee] rounded-r-2xl rounded-tl-2xl"
                  : "bg-[#21af85] text-white rounded-s-2xl rounded-tr-2xl"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Bot Typing Indicator */}
        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img alt="bot typing" src={grandBot} />
              </div>
            </div>
            <div className="p-2 bg-[#eeeeee] rounded-r-2xl rounded-tl-2xl">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}

        {/* Invisible marker for scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input field - fixed bottom */}
      <form onSubmit={handleSend} className="relative w-full">
        <input
          type="text"
          className="input input-bordered rounded-full w-full pr-10" 
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
        >
          <img src={sendIcon} alt="Send" className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default ChatBox;

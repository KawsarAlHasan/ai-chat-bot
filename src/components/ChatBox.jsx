import { useState, useEffect, useRef } from "react";
import grandBot from "../assets/grant-bot.png";
import sendIcon from "../assets/send-icon.png";

import likeIcon from "../assets/ThumbsDown.png";
import likedIcon from "../assets/mdi_like2.png";
import dislikeIcon from "../assets/ThumbsDown2.png";
import dislikedIcon from "../assets/mdi_like.png";

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
  const [feedback, setFeedback] = useState(""); // For capturing the feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(0); // For controlling the feedback modal visibility

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

  const handleLike = (msgIndex) => {
    // Handle like action for the specific message
    const updatedMessages = [...messages];
    updatedMessages[msgIndex].like = true;
    updatedMessages[msgIndex].dislike = false;
    setMessages(updatedMessages);
  };

  const handleDislike = (msgIndex) => {
    // Handle dislike action for the specific message
    // const updatedMessages = [...messages];
    // updatedMessages[msgIndex].dislike = true;
    // setMessages(updatedMessages);
    setFeedback(""); // Clear previous feedback
    setShowFeedbackModal(msgIndex); // Show the feedback modal
  };

  const handleSubmitFeedback = () => {
    const updatedMessages = [...messages];
    updatedMessages[showFeedbackModal].dislike = true;
    updatedMessages[showFeedbackModal].like = false;
    setMessages(updatedMessages);

    setShowFeedbackModal(0); // Close feedback modal after submitting feedback
  };

  return (
    <div className="h-[500px] flex flex-col rounded-lg">
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
            <div className="chat-header text-gray-800">
              {msg.sender === "bot" ? "Grant Bot" : "User"}
              <time className="text-xs text-gray-600 opacity-50 ml-2">
                {msg.time}
              </time>
            </div>
            <div
              className={`p-2 ${
                msg.sender === "bot"
                  ? "bg-[#eeeeee] text-[#000000] rounded-r-2xl rounded-tl-2xl"
                  : "bg-[#21af85] text-white rounded-s-2xl rounded-tr-2xl"
              }`}
            >
              {msg.text}
            </div>

            <div className="chat-footer ">
              {msg.sender === "bot" && (
                <div className="flex space-x-2 mt-1">
                  <button
                    onClick={() => handleLike(i)}
                    // disabled={msg.like || msg.dislike}
                    disabled={msg.like}
                  >
                    {msg.like ? (
                      <img
                        // className={`${
                        //   msg.like || msg.dislike
                        //     ? "cursor-not-allowed"
                        //     : "cursor-pointer"
                        // }`}
                        className="cursor-not-allowed"
                        src={likedIcon}
                        alt="liked-icon"
                      />
                    ) : (
                      <img
                        // className={`${
                        //   msg.like || msg.dislike
                        //     ? "cursor-not-allowed"
                        //     : "cursor-pointer"
                        // }`}
                        className="cursor-pointer"
                        src={likeIcon}
                        alt="like-icon"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => handleDislike(i)}
                    // disabled={msg.dislike || msg.like}
                    disabled={msg.dislike}
                  >
                    {msg.dislike ? (
                      <img
                        // className={`${
                        //   msg.dislike || msg.like
                        //     ? "cursor-not-allowed"
                        //     : "cursor-pointer"
                        // }`}
                        className="cursor-not-allowed"
                        src={dislikedIcon}
                        alt="disliked-icon"
                      />
                    ) : (
                      <img
                        // className={`${
                        //   msg.dislike || msg.like
                        //     ? "cursor-not-allowed"
                        //     : "cursor-pointer"
                        // }`}
                        className="cursor-pointer"
                        src={dislikeIcon}
                        alt="dislike-icon"
                      />
                    )}
                  </button>
                </div>
              )}
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
              <span className="loading loading-dots loading-sm text-[#000000]"></span>
            </div>
          </div>
        )}

        {/* Invisible marker for scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal <= 0 ? (
        <form onSubmit={handleSend} className="relative w-full">
          <input
            type="text"
            className="input input-bordered rounded-full w-full pr-10 bg-[#f5f5f5] text-black focus:outline-none"
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
      ) : (
        <div className=" shadow-gray-500 shadow -m-4 rounded-4xl">
          <div className="bg-[#ffffff] p-4 rounded-4xl">
            <h2 className="text-lg mb-4 text-black text-center">
              Please provide your feedback
            </h2>
            <textarea
              className="bg-[#ffffff] textarea textarea-bordered shadow text-black w-full mb-4 focus:outline-none"
              placeholder="Write your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="btn btn-sm btn-outline rounded-l-4xl px-10 rounded-tr-4xl text-[#21AF85] border-none hover:text-[#21AF85]"
                onClick={() => setShowFeedbackModal(0)}
              >
                Close
              </button>
              <button
                className="btn btn-sm btn-primary rounded-l-4xl px-10 rounded-tr-4xl bg-[#21AF85] border-none text-white"
                onClick={handleSubmitFeedback}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox;

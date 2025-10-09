import { useState, useEffect, useRef } from "react";
import grandBot from "../assets/grant-bot.png";
import sendIcon from "../assets/send-icon.png";

import likeIcon from "../assets/ThumbsDown.png";
import likedIcon from "../assets/mdi_like2.png";
import dislikeIcon from "../assets/ThumbsDown2.png";
import dislikedIcon from "../assets/mdi_like.png";
import { API, useConversationsMessages } from "../api/api";

const insitiolMessages = [
  "Hello! 👋 I'm GrantBot — your smart assistant for discovering grants that match your goals. How can I help you today?",
  "Welcome to GrantBot! 🎯 Whether you're a student, researcher, or startup, I’ll help you find funding opportunities that fit your needs.",
  "Hi there! I’m GrantBot — here to make finding and applying for grants simple and stress-free. What kind of grant are you looking for?",
  "👋 Welcome! GrantBot at your service. I can help you explore available grants, check eligibility, or guide you through applications. Where shall we start?",
  "Hey! 🌟 Looking for financial support or funding options? You’ve come to the right place — I’m GrantBot, your personal funding assistant.",
  "Welcome! 🚀 I’m here to help you navigate the world of grants — from research grants to business funding. What brings you here today?",
  "Hi! 💡 I’m GrantBot — your 24/7 guide to finding grants, scholarships, and funding opportunities. Want me to show you some options?",
  "👋 Welcome to GrantBot! I specialize in matching your profile with the best grant programs out there. Ready to begin?",
  "Greetings! 🎓 Are you searching for student, research, or community project grants? I can help you locate and understand them easily.",
  "Welcome aboard! I’m GrantBot — think of me as your funding matchmaker. Tell me a bit about your project or need.",
  "Hi there! 🌍 Need help with your grant search? I can assist you in finding open grants, checking requirements, or preparing to apply.",
  "👋 Welcome! I’m GrantBot — I make it easier to find the right grants and understand how to apply. What type of grant are you interested in?",
  "Hello and welcome! 🎉 Looking for funding for education, business, or research? Let’s find the perfect grant for you.",
  "Hi 👋 — GrantBot here! I help individuals, startups, and organizations discover available grants. Shall we start with your area or purpose?",
  "Welcome to GrantBot! 💰 Your companion in exploring financial aid, research grants, and business funding. What can I help you with today?",
];

function ChatBox() {
  const conversationId = localStorage.getItem("conversationId");

  const { conversationsMessages, isLoading, isError, error, refetch } =
    useConversationsMessages(conversationId);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState(""); // For capturing the feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(0); // For controlling the feedback modal visibility
  const [showInitialMessage, setShowInitialMessage] = useState(false);

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Ref for auto scroll
  const messagesEndRef = useRef(null);

  // Convert API messages to app format
  useEffect(() => {
    if (conversationsMessages?.messages) {
      const formattedMessages = conversationsMessages.messages.map((msg) => ({
        id: msg.id,
        sender: msg.role === "user" ? "user" : "bot",
        text: msg.text,
        time: formatTime(msg.created_at), // new Date(msg.created_at).toLocaleTimeString().slice(0, 5),
        url: msg.url,
        like: msg.liked === true,
        dislike: msg.liked === false,
        reason_to_dislike: msg.reason_to_dislike,
      }));

      setMessages(formattedMessages);
    }
  }, [conversationsMessages]);

  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        setShowInitialMessage(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      sender: "user",
      text: input,
      time: formatTime(new Date()), // new Date().toLocaleTimeString().slice(0, 5),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await API.post(
        `/conversations/${conversationId}/send-message/`,
        {
          text: input,
        }
      );

      console.log(response, "response");

      if (response.status === 200) {
        // Refetch messages to get updated conversation
        refetch();
      } else if (response.status === 400) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Sorry, there was an error processing your request. Please try again.",
            time: formatTime(new Date()), // new Date().toLocaleTimeString().slice(0, 5),
          },
        ]);
      }
    } catch (error) {
      console.log(error, "error");

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, there was an error processing your request. Please try again.",
          time: formatTime(new Date()), // new Date().toLocaleTimeString().slice(0, 5),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleLike = async (msgIndex) => {
    const messageId = messages[msgIndex].id;

    try {
      await API.post(
        `/conversations/${conversationId}/send-reaction/${messageId}/`,
        {
          liked: true,
        }
      );

      const updatedMessages = [...messages];
      updatedMessages[msgIndex].like = true;
      updatedMessages[msgIndex].dislike = false;
      setMessages(updatedMessages);
    } catch (error) {
      console.log("Error updating like:", error);
    }
  };

  const handleDislike = (msgIndex) => {
    setFeedback(""); // Clear previous feedback
    setShowFeedbackModal(msgIndex); // Show the feedback modal
  };

  const handleSubmitFeedback = async () => {
    const msgIndex = showFeedbackModal;
    const messageId = messages[msgIndex].id;

    try {
      // Update in backend
      await API.post(
        `/conversations/${conversationId}/send-reaction/${messageId}/`,
        {
          liked: false,
          reason_to_dislike: feedback,
        }
      );

      // Update local state
      const updatedMessages = [...messages];
      updatedMessages[msgIndex].dislike = true;
      updatedMessages[msgIndex].like = false;
      updatedMessages[msgIndex].reason_to_dislike = feedback;
      setMessages(updatedMessages);

      setShowFeedbackModal(0); // Close feedback modal
      setFeedback(""); // Clear feedback text
    } catch (error) {
      console.log("Error updating dislike:", error);
    }
  };

  // causes the message to change while the user is typing.
  const randomIndexRef = useRef(
    Math.floor(Math.random() * insitiolMessages.length)
  );
  const randomMessage = insitiolMessages[randomIndexRef.current];

  return (
    <div className="h-[525px] flex flex-col rounded-lg">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-6 p-2">
        {isError && (
          <div className="text-center text-lg text-red-500">
            Something went wrong. Please try again.
          </div>
        )}

        {isLoading ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
              <div className="skeleton h-10 w-3/5"></div>
            </div>

            <div className="flex items-end !chat !chat-end gap-2">
              <div className="skeleton h-10 w-3/5"></div>
              <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
            </div>

            <div className="flex items-center gap-2">
              <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
              <div className="skeleton h-10 w-3/5"></div>
            </div>

            <div className="flex items-end !chat !chat-end gap-2">
              <div className="skeleton h-10 w-3/5"></div>
              <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
            </div>

            <div className="flex items-center gap-2">
              <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
              <div className="skeleton h-10 w-3/5"></div>
            </div>

            <div className="flex items-end !chat !chat-end gap-2">
              <div className="skeleton h-10 w-3/5"></div>
              <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <>
                {!showInitialMessage ? (
                  <div className="chat chat-start">
                    <div className="chat-image avatar -m-1">
                      <div className="w-10 rounded-full">
                        <img alt="bot typing" src={grandBot} />
                      </div>
                    </div>
                    <div className="p-2 max-w-[70%] whitespace-normal break-words bg-[#eeeeee] rounded-r-2xl rounded-tl-2xl">
                      <span className="loading loading-dots loading-sm text-[#000000]"></span>
                    </div>
                  </div>
                ) : (
                  <div className=" -mb-0.5 chat chat-start">
                    <div className="chat-image avatar -m-1">
                      <div className="w-10 rounded-full">
                        <img alt="avatar" src={grandBot} />
                      </div>
                    </div>
                    <div className="chat-header text-gray-800">
                      {"Grant Bot"}
                      <time className="text-xs text-gray-600 opacity-50 ml-2">
                        {formatTime(new Date())}
                      </time>
                    </div>
                    <div className="p-2 max-w-[80%] whitespace-normal break-words bg-[#eeeeee] text-[#000000] rounded-r-2xl rounded-tl-2xl">
                      {randomMessage}
                    </div>
                  </div>
                )}
              </>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={` -mb-0.5 chat ${
                    msg.sender === "bot" ? "chat-start" : "chat-end"
                  }`}
                >
                  <div className="chat-image avatar -m-1">
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
                    {msg.sender === "bot" ? "Grant Bot" : "You"}
                    <time className="text-xs text-gray-600 opacity-50 ml-2">
                      {msg.time}
                    </time>
                  </div>
                  <div
                    className={`p-2 max-w-[80%] whitespace-normal break-words ${
                      msg.sender === "bot"
                        ? "bg-[#eeeeee] text-[#000000] rounded-r-2xl rounded-tl-2xl "
                        : "bg-[#21af85] text-white rounded-s-2xl rounded-tr-2xl"
                    }`}
                  >
                    {msg.text}
                    {msg.url && (
                      <p className="mt-0.5">
                        <span className="font-semibold pr-1">Link:</span>
                        <a
                          href={msg.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {msg.url}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="chat-footer ">
                    {msg.sender === "bot" && (
                      <div className="flex space-x-2 mt-1">
                        <button
                          onClick={() => handleLike(i)}
                          disabled={msg.like}
                        >
                          {msg.like ? (
                            <img
                              className="cursor-not-allowed"
                              src={likedIcon}
                              alt="liked-icon"
                            />
                          ) : (
                            <img
                              className="cursor-pointer"
                              src={likeIcon}
                              alt="like-icon"
                            />
                          )}
                        </button>
                        <button
                          onClick={() => handleDislike(i)}
                          disabled={msg.dislike}
                        >
                          {msg.dislike ? (
                            <img
                              className="cursor-not-allowed"
                              src={dislikedIcon}
                              alt="disliked-icon"
                            />
                          ) : (
                            <img
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
              ))
            )}
          </>
        )}

        {/* Bot Typing Indicator */}
        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar -m-1">
              <div className="w-10 rounded-full">
                <img alt="bot typing" src={grandBot} />
              </div>
            </div>
            <div className="p-2 max-w-[70%] whitespace-normal break-words bg-[#eeeeee] rounded-r-2xl rounded-tl-2xl">
              <span className="loading loading-dots loading-sm text-[#000000]"></span>
            </div>
          </div>
        )}

        {/* Invisible marker for scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Feedback Modal */}
      <div className="">
        {showFeedbackModal <= 0 ? (
          <div className="px-4">
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
          </div>
        ) : (
          <div className="shadow-gray-800 m-0.5 shadow rounded-4xl">
            <div className="bg-[#ffffff] p-4 rounded-4xl">
              <h2 className="text-lg mb-4 text-black text-center">
                Please provide your feedback
              </h2>
              <textarea
                className="bg-[#ffffff] textarea textarea-bordered shadow text-black w-full mb-4 focus:outline-none focus:border-gray-300"
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
    </div>
  );
}

export default ChatBox;

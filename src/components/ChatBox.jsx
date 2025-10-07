import { useState, useEffect, useRef } from "react";
import grandBot from "../assets/grant-bot.png";
import sendIcon from "../assets/send-icon.png";

import likeIcon from "../assets/ThumbsDown.png";
import likedIcon from "../assets/mdi_like2.png";
import dislikeIcon from "../assets/ThumbsDown2.png";
import dislikedIcon from "../assets/mdi_like.png";
import { API, useConversationsMessages } from "../api/api";

function ChatBox() {
  const conversationId = localStorage.getItem("conversationId");

  const { conversationsMessages, isLoading, isError, error, refetch } =
    useConversationsMessages(conversationId);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState(""); // For capturing the feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(0); // For controlling the feedback modal visibility

  // Ref for auto scroll
  const messagesEndRef = useRef(null);

  // Convert API messages to app format
  useEffect(() => {
    if (conversationsMessages?.messages) {
      const formattedMessages = conversationsMessages.messages.map((msg) => ({
        id: msg.id,
        sender: msg.role === "user" ? "user" : "bot",
        text: msg.text,
        time: new Date(msg.created_at).toLocaleTimeString().slice(0, 5),
        like: msg.liked === true,
        dislike: msg.liked === false,
        reason_to_dislike: msg.reason_to_dislike,
      }));

      setMessages(formattedMessages);
    }
  }, [conversationsMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString().slice(0, 5),
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

      if (response.statusText === "OK") {
        // Refetch messages to get updated conversation
        refetch();
      }
    } catch (error) {
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, there was an error processing your request. Please try again.",
          time: new Date().toLocaleTimeString().slice(0, 5),
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
      // Update in backend
      await API.post(`/messages/${messageId}/feedback/`, {
        liked: true,
        reason_to_dislike: null,
      });

      // Update local state
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
      await API.post(`/messages/${messageId}/feedback/`, {
        liked: false,
        reason_to_dislike: feedback,
      });

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

  return (
    <div className="h-[500px] flex flex-col rounded-lg">
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
              <div className="text-center text-gray-500 py-8">
                Start a conversation by sending a message!
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id || i}
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
                        ? "bg-[#eeeeee] text-[#000000] rounded-r-2xl rounded-tl-2xl "
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
        <div className="shadow-gray-800 shadow -m-4 rounded-4xl">
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
  );
}

export default ChatBox;

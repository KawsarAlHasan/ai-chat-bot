import { useState, useEffect, useRef } from "react";
import grandBot from "../assets/grant-bot.png";
import sendIcon from "../assets/send-icon.png";
import userIcon from "../assets/user.png";
import likeIcon from "../assets/ThumbsDown.png";
import likedIcon from "../assets/mdi_like2.png";
import dislikeIcon from "../assets/ThumbsDown2.png";
import dislikedIcon from "../assets/mdi_like.png";
import { API, useConversationsMessages, useAiResponse } from "../api/api";

function ChatBox({ emailMessage, emailError }) {
  const conversationId = localStorage.getItem("conversationId") || null;
  const greetingMessage = localStorage.getItem("greetingMessage") || null;

  const { conversationsMessages, isLoading, isError, error, refetch } =
    useConversationsMessages(conversationId);

  const [taskId, setTaskId] = useState(null);

  // Poll ai response when taskId is set
  const {
    aiResponse,
    isLoading: aiResponseLoading,
    refetch: aiResponseRefetch,
  } = useAiResponse(taskId);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState(""); // For capturing the feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(-1); // -1 means closed
  const [showInitialMessage, setShowInitialMessage] = useState(false);

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (err) {
      return "";
    }
  };

  // Ref for auto scroll
  const messagesEndRef = useRef(null);

  // Convert API messages to app format whenever conversationsMessages updates
  useEffect(() => {
    if (conversationsMessages?.messages) {
      console.log(conversationsMessages?.messages, "conversationsMessages");
      const formattedMessages = conversationsMessages.messages.map((msg) => ({
        id: msg.id,
        sender: msg.role === "user" ? "user" : "bot",
        role: msg.role,
        query_type: msg.query_type,
        query_count: msg.query_count,
        text: msg.text,
        time: formatTime(msg.created_at),
        url: msg.url,
        like: msg.liked === true,
        dislike: msg.liked === false,
        reason_to_dislike: msg.reason_to_dislike,
      }));

      setMessages(formattedMessages);
    }
  }, [conversationsMessages]);

  // show initial bot message after short delay if no messages
  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        setShowInitialMessage(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Manage typing indicator based on aiResponse polling
  useEffect(() => {
    // if there's an active taskId and aiResponse is loading -> show typing
    if (taskId && aiResponseLoading) {
      setIsTyping(true);
      return;
    }

    // if we have aiResponse and status success -> fetch messages + stop typing
    if (taskId && aiResponse?.data?.status === "success") {
      // refetch conversations so the AI message appears
      refetch();
      setIsTyping(false);
      // clear taskId to stop polling (useAiResponse's refetchInterval stops when taskId becomes null)
      setTaskId(null);
    }
  }, [taskId, aiResponseLoading, aiResponse, refetch]);

  // Auto scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();

    // Add optimistic user message
    const newMessage = {
      id: `tmp-${Date.now()}`,
      sender: "user",
      text: userText,
      time: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await API.post(
        `/conversations/${conversationId}/send-message/`,
        {
          text: userText,
        }
      );

      if (response.status === 200 && response.data?.data?.task_id) {
        const returnedTaskId = response.data.data.task_id;
        setTaskId(returnedTaskId);
        // useAiResponse hook will poll automatically
      } else {
        // fallback error message
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "bot",
            text: "Sorry, there was an error starting the AI process. Please try again.",
            time: formatTime(new Date()),
          },
        ]);
      }
    } catch (err) {
      console.log("send-message error:", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: "Sorry, there was an error processing your request. Please try again.",
          time: formatTime(new Date()),
        },
      ]);
    }
  };

  const handleLike = async (msgIndex) => {
    const message = messages[msgIndex];
    if (!message?.id) return;

    try {
      await API.post(
        `/conversations/${conversationId}/send-reaction/${message.id}/`,
        {
          liked: true,
        }
      );

      const updatedMessages = [...messages];
      updatedMessages[msgIndex] = {
        ...updatedMessages[msgIndex],
        like: true,
        dislike: false,
        reason_to_dislike: null,
      };
      setMessages(updatedMessages);
    } catch (error) {
      console.log("Error updating like:", error);
    }
  };

  const handleDislike = (msgIndex) => {
    setFeedback("");
    setShowFeedbackModal(msgIndex); // open modal for that message
  };

  const handleSubmitFeedback = async () => {
    const msgIndex = showFeedbackModal;
    if (msgIndex === -1) return;
    const message = messages[msgIndex];
    if (!message?.id) {
      setShowFeedbackModal(-1);
      return;
    }

    try {
      await API.post(
        `/conversations/${conversationId}/send-reaction/${message.id}/`,
        {
          liked: false,
          reason_to_dislike: feedback,
        }
      );

      const updatedMessages = [...messages];
      updatedMessages[msgIndex] = {
        ...updatedMessages[msgIndex],
        dislike: true,
        like: false,
        reason_to_dislike: feedback,
      };
      setMessages(updatedMessages);
      setShowFeedbackModal(-1);
      setFeedback("");
    } catch (error) {
      console.log("Error updating dislike:", error);
    }
  };

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
                      {greetingMessage}
                    </div>
                  </div>
                )}
              </>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id || `msg-${i}`}
                  className={` -mb-0.5 chat ${
                    msg.sender === "bot" ? "chat-start" : "chat-end"
                  }`}
                >
                  <div className="chat-image avatar -m-1">
                    <div className="w-10 rounded-full">
                      <img
                        alt="avatar"
                        src={msg.sender === "bot" ? grandBot : userIcon}
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
                    {msg.text}{" "}
                    {msg.query_count && <strong>{msg.query_count}</strong>}
                    {msg.query_type == "grant" && msg.query_count !== null && (
                      <>
                        <div className="border-b-[1px] border-gray-500 my-2 mx-1"></div>
                        <p className="">
                          Click on the link below to view the grant report. The
                          report link will be sent to your email's inbox.
                        </p>
                      </>
                    )}
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

        {emailMessage && (
          <p className="text-green-500 mt-4 text-center">{emailMessage}</p>
        )}

        {emailError && (
          <p className="text-red-500 mt-4 text-center">{emailError}</p>
        )}

        {/* Invisible marker for scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Feedback Modal / Input Area */}
      <div className="">
        {showFeedbackModal === -1 ? (
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
                  onClick={() => setShowFeedbackModal(-1)}
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

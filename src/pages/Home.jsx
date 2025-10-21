import { useEffect, useState, useRef } from "react";
import grandBot from "../assets/grant-bot.png";
import logo from "../assets/logo.png";
import refreshImage from "../assets/image-removebg-preview.png";
import emailImage from "../assets/email.png";
import ChatBox from "../components/ChatBox";
import { API } from "../api/api";

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const emailData = queryParams.get("email");
    localStorage.setItem("email", emailData);

    if (emailData) {
      localStorage.removeItem("sessionId");
    }

    const conversationId = localStorage.getItem("conversationId");
    const isEmailConversation = localStorage.getItem("isEmailConversation");
    const email = localStorage.getItem("email");

    const sessionId = localStorage.getItem("sessionId");
    const conversationIdSessionId = localStorage.getItem(
      "conversationIdSessionId"
    );
    const conversationIdEmail = localStorage.getItem("conversationIdEmail");

    const checkSessionId = conversationId + sessionId;
    const checkEmail = conversationId + email;

    if (isEmailConversation == "false") {
      if (conversationIdSessionId !== checkSessionId) {
        localStorage.removeItem("conversationId");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("conversationIdSessionId");
      }
    } else {
      if (conversationIdEmail !== checkEmail) {
        console.log("checkEmail 39", conversationIdEmail);
        console.log("checkEmail 40", checkEmail);
        localStorage.removeItem("isEmailConversation");
        localStorage.removeItem("conversationId");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("conversationIdSessionId");
      }
    }
  }, []);

  const isEmailConversation = localStorage.getItem("isEmailConversation");

  const handleBotClick = () => {
    setIsOpen(true);
    setShowChatBox(false);
  };

  const handleOpenChat = async () => {
    setIsLoading(true);

    const conversationId = localStorage.getItem("conversationId");

    if (conversationId) {
      setShowChatBox(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await API.post("/conversations/");

      if (response.status === 201) {
        let conversationId = response.data.id;
        let sessionId = response.data.session_id;
        let greetingMessage = response?.data?.greeting_message;

        const email = localStorage.getItem("email");

        if (sessionId) {
          localStorage.setItem("sessionId", sessionId);
          localStorage.setItem(
            "conversationIdSessionId",
            conversationId + sessionId
          );
        } else {
          localStorage.setItem("conversationIdEmail", conversationId + email);
        }

        localStorage.setItem("greetingMessage", greetingMessage);
        localStorage.setItem("conversationId", conversationId);
        localStorage.setItem("isEmailConversation", sessionId ? false : true);
        setShowChatBox(true);
      }
    } catch (error) {
      console.log(error, "error");
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowChatBox(false);
  };

  const handleRefresh = async () => {
    setIsRefreshLoading(true);
    try {
      const response = await API.post("/conversations/");
      if (response.status === 201) {
        let conversationId = response.data.id;
        let sessionId = response.data.session_id;
        let greetingMessage = response?.data?.greeting_message;

        localStorage.setItem("greetingMessage", greetingMessage);
        localStorage.setItem("conversationId", conversationId);
        localStorage.setItem("sessionId", sessionId);
        setShowChatBox(true);
      }
    } catch (error) {
      console.log(error, "error");
      setError("An error occurred. Please try again.");
    } finally {
      setIsRefreshLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsEmailSending(true);
    // clear any previous timer so messages don't get cleared prematurely
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      const conversationId = localStorage.getItem("conversationId");
      const response = await API.post(
        `/conversations/${conversationId}/email-conversation/`
      );
      console.log(response, "response");
      setEmailMessage("Email sent successfully on your email!");
      // clear the success message after 3 seconds
      timerRef.current = setTimeout(() => {
        setEmailMessage("");
        timerRef.current = null;
      }, 4000);
    } catch (error) {
      console.log(error, "error");
      setEmailError("An error occurred. Please try again.");

      timerRef.current = setTimeout(() => {
        setEmailError("");
        timerRef.current = null;
      }, 4000);
    } finally {
      setIsEmailSending(false);
    }
  };

  // cleanup any pending timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="">
      {/* floating bot icon */}
      <div className="fixed bottom-0 right-0 z-50">
        <img
          role="button"
          className="cursor-pointer w-[80px]"
          src={grandBot}
          alt="grant-bot"
          onClick={handleBotClick}
        />
      </div>

      {/* widget box */}
      {isOpen && (
        <div className="fixed bottom-[70px] right-0 z-50 bg-white  rounded-4xl w-[393px] shadow shadow-gray-500/50 flex flex-col">
          {!showChatBox ? (
            <div className="p-4">
              <div className="flex justify-between">
                <div></div>
                <button
                  onClick={handleClose}
                  className="self-end text-gray-900 hover:text-gray-500 w-8 h-8 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center justify-center flex-1 h-[550px] ">
                <img className="w-[131px]" src={logo} alt="logo" />
                <h1 className="text-black text-center text-[40px] font-bold my-5">
                  TGP-Man
                </h1>
                <p className="text-center text-black text-[16px]">
                  Your AI-powered assistant to help you find the perfect grant
                  opportunities.
                </p>
                <button
                  onClick={handleOpenChat}
                  disabled={isLoading}
                  className="btn btn-primary bg-[#21AF85] border-none mt-10 rounded-s-[50px] rounded-tr-[100px] w-[231px] py-[20px]"
                >
                  {isLoading ? "Loading..." : "Chat Now"}
                </button>

                {error && <p className="text-red-500 mt-4">{error}</p>}
              </div>
            </div>
          ) : (
            <div className="rounded-4xl h-[620px]">
              <div className="flex justify-between bg-[#21af85] p-4 rounded-t-4xl">
                <img
                  className="w-[50px] h-[50px] p-1"
                  src={grandBot}
                  alt="logo"
                />

                <div>
                  <h1 className="text-white text-[20px]">Grant Bot</h1>
                  <p className="text-[#04FF00]">🟢 Online</p>
                </div>

                <div className="flex justify-center items-center">
                  <button onClick={handleRefresh}>
                    <img
                      className={`w-8 h-auto cursor-pointer mr-2 ${
                        isRefreshLoading ? "animate-spin" : ""
                      }`}
                      title="Refresh conversation"
                      src={refreshImage}
                      alt="refresh"
                    />
                  </button>

                  {isEmailConversation == "true" && (
                    <button
                      className="cursor-pointer"
                      onClick={handleSendEmail}
                      disabled={isEmailSending}
                      aria-label={
                        isEmailSending
                          ? "Sending email"
                          : "Send conversation to email"
                      }
                    >
                      {isEmailSending ? (
                        <img
                          className="w-8 h-8 mr-2 animate-spin"
                          title="Sending..."
                          src={refreshImage}
                          alt="sending"
                        />
                      ) : (
                        <img
                          className="w-8 h-8 mr-2"
                          title="Send Conversation to Email"
                          src={emailImage}
                          alt="email"
                        />
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleClose}
                    className="text-white hover:text-gray-600 w-8 h-8 flex items-center justify-center border-white hover:border-gray-600 border rounded-full cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                <ChatBox emailMessage={emailMessage} emailError={emailError} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;

import { useState } from "react";
import grandBot from "./assets/grant-bot.png";
import logo from "./assets/logo.png";
import ChatBox from "./components/ChatBox";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);

  const handleBotClick = () => {
    setIsOpen(true);
    setShowChatBox(false);
  };

  const handleOpenChat = () => {
    setShowChatBox(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowChatBox(false);
  };

  return (
    <div>
      {/* floating bot icon */}
      <div className="fixed bottom-5 right-5 z-50">
        <img
          role="button"
          className="cursor-pointer w-[70px]"
          src={grandBot}
          alt="grant-bot"
          onClick={handleBotClick}
        />
      </div>

      {/* widget box */}
      {isOpen && (
        <div className="fixed bottom-[100px] right-5 z-50 bg-white rounded-4xl w-[393px] shadow-2xl shadow-gray-500/50 flex flex-col">
          {!showChatBox ? (
            <div className="p-4">
              <div className="flex justify-between">
                <div></div>
                <button
                  onClick={handleClose}
                  className="self-end text-gray-600 border border-gray-600 hover:text-white w-8 h-8  hover:bg-gray-600 rounded-full cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center justify-center flex-1 h-[600px] ">
                <img className="w-[131px]" src={logo} alt="logo" />
                <h1 className="text-center text-[40px] font-bold my-5">
                  TGP-Man
                </h1>
                <p className="text-center text-[16px]">
                  Your AI-powered assistant to help you find the perfect grant
                  opportunities.
                </p>
                <button
                  onClick={handleOpenChat}
                  className="btn btn-primary bg-[#21AF85] border-none mt-10 rounded-s-[50px] rounded-tr-[100px] w-[231px] py-[20px]"
                >
                  Chat Now
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-4xl h-[670px]">
              <div className="flex justify-between bg-[#21af85] p-4 rounded-t-4xl">
                <img className="w-[45px] p-1" src={grandBot} alt="logo" />

                <div>
                  <h1 className="text-white text-[20px]">Grant Bot</h1>
                  <p className="text-[#04FF00]">🟢 Online</p>
                </div>

                <div className="flex justify-center items-center">
                  <button
                    onClick={handleClose}
                    className="text-white hover:text-gray-600 w-8 h-8 flex items-center justify-center border-white hover:border-gray-600 border rounded-full cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4">
                <ChatBox />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

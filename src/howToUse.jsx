import React from "react";

function howToUse() {
  return (
    <div>
      {/* how to use react page */}
      <iframe
        src={`http://localhost:5175?token=${localStorage.getItem("token")}`}
        title="AI Chatbot"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "500px",
          height: "1000px",
          border: "none",
          zIndex: 9999,
          background: "transparent",
        }}
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />


      {/* how to use html page */}
      <iframe
        src="http://localhost:5175/"
        title="AI Chatbot"
        style="position: fixed; bottom: 20px; right: 20px; width: 500px; height: 1000px; border: none; z-index: 9999; background: transparent;"
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      ></iframe>
    </div>
  );
}

export default howToUse;

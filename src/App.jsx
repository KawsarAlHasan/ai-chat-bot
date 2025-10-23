import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Report from "./pages/Report";

function App() {
 
  // useEffect(() => {
  //   window.closeTab = () => {
  //     const data = {
  //       lastVisit: new Date().toISOString(),
  //       userStatus: "Tab Closed",
  //     };
  //     localStorage.setItem("tabCloseData", JSON.stringify(data));
  //   };
  // }, []);

  return (
    <div>
      <Routes>
        <Route path="/chat" element={<Home />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </div>
  );
}

export default App;

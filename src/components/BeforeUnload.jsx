import { useEffect } from "react";

export const useBeforeUnload = (value) => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("helloworld", value);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [value]);
};

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const API = axios.create({
  baseURL: "http://10.10.7.91:8006/api/v1",
});

API.interceptors.request.use((config) => {
  const email = localStorage.getItem("email");
  if (email) {
    config.headers["X-User-Email"] = email;
  }

  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    config.headers["X-Session-ID"] = sessionId;
  }

  return config;
});

// get conversations Message
export const useConversationsMessages = (conversationId) => {
  const getData = async () => {
    const response = await API.get(`/conversations/${conversationId}/`);
    return response.data;
  };

  const {
    data: conversationsMessages = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversationsMessages", conversationId],
    queryFn: getData,
  });

  return { conversationsMessages, isLoading, isError, error, refetch };
};

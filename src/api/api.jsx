import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const API = axios.create({
  baseURL: "https://tcgbackend.dsrt321.online/api/v1",
  // baseURL: "http://localhost:8099/api/v1/settings/terms"
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
    if (!conversationId) return null;
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
    enabled: !!conversationId,
  });

  return { conversationsMessages, isLoading, isError, error, refetch };
};

// useAiResponse hook: polls the ai-response-receiver endpoint while taskId exists
export const useAiResponse = (taskId, options = {}) => {
  const getData = async () => {
    if (!taskId) return null;
    const response = await API.get(
      `/conversations/ai-response-receiver/?task_id=${taskId}`
    );
    return response.data;
  };

  const {
    data: aiResponse = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["aiResponse", taskId],
    queryFn: getData,
    enabled: !!taskId,
    refetchInterval: (data) => {
      if (!taskId) return false;
      if (data?.data?.status === "success") return false;
      return 500;
    },
    ...options,
  });

  return { aiResponse, isLoading, isError, error, refetch };
};

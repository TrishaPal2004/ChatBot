import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Divider,
  Container,
  Button,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import LogoutIcon from "@mui/icons-material/Logout";
import { getConversationById, sendChatRequest, getChatHistory } from "../helpers/api-communicator";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast from "react-hot-toast";

// Extract code blocks function
function extractCodeBlocks(message: string) {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: { type: "text" | "code"; content: string; language?: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(message)) !== null) {
    const [fullMatch, lang = "text", code] = match;

    if (match.index > lastIndex) {
      blocks.push({
        type: "text",
        content: message.slice(lastIndex, match.index),
      });
    }

    blocks.push({ type: "code", language: lang, content: code });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < message.length) {
    blocks.push({ type: "text", content: message.slice(lastIndex) });
  }

  return blocks;
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
};

const Chat = () => {
  const auth = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [chatMessages, setchatMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to bottom ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isThinking]);

  // Check if user is authenticated
  useEffect(() => {
    if (!auth?.user) {
      console.log("User not authenticated");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [auth?.user]);

  // Fetch chat history when component mounts and user is authenticated
  useEffect(() => {
    async function fetchHistory() {
      if (!auth?.user) return;
      
      try {
        const history = await getChatHistory();
        setChatHistory(history);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setError("Failed to load chat history");
      }
    }
    
    if (auth?.user) {
      fetchHistory();
    }
  }, [auth?.user]);

  // Load user chats - FIXED: removed undefined getUserChats function
  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth?.user) {
      toast.loading("Loading chats", { id: "loadchats" });
      
      // Use the correct function to get user chats
      getConversationById("")  // This might need adjustment based on your API
        .then((data) => {
          // Only set chat messages if we have valid data
          if (data && data.chats && Array.isArray(data.chats)) {
            setchatMessages([...data.chats]);
            toast.success("Successfully loaded chats", { id: "loadchats" });
          } else {
            toast.dismiss("loadchats");
          }
        })
        .catch((error) => {
          console.error("Failed to load chats:", error); // FIXED: changed 'err' to 'error'
          toast.error("Loading failed", { id: "loadchats" });
          // Don't set error state here, just log it
        });
    }
  }, [auth?.isLoggedIn, auth?.user]);

  const handleSubmit = async () => {
    if (!auth?.user) {
      console.error("User not authenticated");
      setError("Please log in to send messages");
      return;
    }

    const content = inputRef.current?.value?.trim();
    if (!content) return;

    if (inputRef.current) inputRef.current.value = "";

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setchatMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setError(null); // Clear any previous errors

    try {
      const response = await sendChatRequest(content, conversationId || undefined);

      if (response?.success && response?.data) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.data.message,
          timestamp: new Date(),
        };

        setConversationId(response.data.conversationId);
        setchatMessages((prev) => [...prev, botMessage]);
        
        // Refresh chat history after successful message
        try {
          const updatedHistory = await getChatHistory();
          setChatHistory(updatedHistory);
        } catch (historyError) {
          console.error("Failed to refresh chat history:", historyError);
        }
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: response?.message || "Something went wrong!",
          timestamp: new Date(),
          isError: true,
        };
        setchatMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error: unknown) {
      let errorMsgText = "Error communicating with ZOROTalk.";
      if (error instanceof Error && error.message) {
        errorMsgText = error.message;
      }
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: errorMsgText,
        timestamp: new Date(),
        isError: true,
      };
      setchatMessages((prev) => [...prev, errorMsg]);
    }

    setIsThinking(false);
  };

  const handleLoadChat = async (chatId: string, index: number) => {
    if (!auth?.user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Loading chat: ${chatId}`);
      
      const response = await fetch(`http://localhost:5000/api/v1/chat/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Explicitly request JSON
        },
        credentials: 'include',
      });
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response URL: ${response.url}`);
      console.log(`Response headers:`, response.headers);
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      if (!response.ok) {
        // Log the actual response for debugging
        const errorText = await response.text();
        console.error(`HTTP ${response.status} Error Response:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Verify we're getting JSON before parsing
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Expected JSON but got:', contentType);
        console.error('Response body:', responseText.substring(0, 200) + '...');
        throw new Error('Server returned HTML instead of JSON. Check if the API endpoint exists and authentication is working.');
      }
      
      const data = await response.json();
      console.log('Chat data received:', data);
      
      if (data && data.success) {
        setchatMessages(data.data.messages || []);
        setConversationId(chatId);
      } else {
        console.error("Failed to load chat:", data?.message);
        setError(data?.message || "Failed to load chat");
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error loading chat");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new chat
  const handleNewChat = () => {
    setchatMessages([]);
    setConversationId(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  // Show login prompt if user is not authenticated
  if (!auth?.user) {
    return (
      <Container maxWidth="xl" sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center", background: "#181818", color: "white" }}>
          <Typography variant="h5" gutterBottom>
            Please log in to continue
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You need to be authenticated to use ZOROTalk.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        py: 2,
        background: "linear-gradient(135deg, #101010 0%, #181818 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}
        >
          {error}
        </Alert>
      )}

      {/* Left Sidebar - Chat History */}
      <Box sx={{ width: 280, pr: 2 }}>
        {/* User Info Header */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            background: "linear-gradient(90deg, #181818 60%, #232526 100%)",
            color: "white",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#00bcd4" }}>
                {auth.user.name?.[0] || "U"}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {auth.user.name || "User"}
              </Typography>
            </Box>
            <IconButton onClick={handleLogout} size="small" sx={{ color: "rgba(255,255,255,0.7)" }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* New Chat Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleNewChat}
          sx={{
            mb: 2,
            bgcolor: "#00bcd4",
            color: "white",
            "&:hover": {
              bgcolor: "#0097a7",
            },
          }}
        >
          New Chat
        </Button>

        {/* Chat History */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            background: "linear-gradient(120deg, #181818 0%, #232526 100%)",
            color: "white",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.06)",
            maxHeight: "calc(100vh - 250px)",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontSize: "1rem" }}>
            Chat History
          </Typography>
          
          {chatHistory.length === 0 ? (
            <Typography color="gray" variant="body2">
              No past chats found.
            </Typography>
          ) : (
            chatHistory.map((id, index) => (
              <Button
                key={id}
                variant="outlined"
                fullWidth
                sx={{
                  mb: 1,
                  color: "white",
                  borderColor: "rgba(255,255,255,0.2)",
                  justifyContent: "flex-start",
                  "&:hover": {
                    borderColor: "#00bcd4",
                    backgroundColor: "rgba(0,188,212,0.08)",
                  },
                }}
                onClick={() => handleLoadChat(id, index)}
              >
                Chat #{index + 1}
              </Button>
            ))
          )}
        </Paper>
      </Box>

      {/* Right Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            background: "linear-gradient(90deg, #181818 60%, #232526 100%)",
            color: "white",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 32px 0 rgba(0,0,0,0.45)",
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "white",
              fontWeight: 600,
            }}
          >
            <img
              src="/Zoro.jpeg"
              alt="AI Avatar"
              style={{
                borderRadius: "50%",
                width: "45px",
                height: "45px",
                objectFit: "cover",
                border: "2.5px solid #00bcd4",
                boxShadow: "0 0 12px 2px #00bcd4",
              }}
            />
            ZOROTalk
          </Typography>
        </Paper>

        {/* Chat Messages Container */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(120deg, #181818 0%, #232526 100%)",
            borderRadius: 3,
            color: "white",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 32px 0 rgba(0,0,0,0.55)",
            position: "relative",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {chatMessages.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  flexDirection: "column",
                  color: "text.secondary",
                }}
              >
                <SmartToyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="white">
                  Start a conversation!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ask me anything and I'll help you out.
                </Typography>
              </Box>
            ) : (
              chatMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent:
                      message.role === "user" ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      maxWidth: "70%",
                      flexDirection:
                        message.role === "user" ? "row-reverse" : "row",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor:
                          message.role === "user"
                            ? "#00bcd4"
                            : "rgba(0,0,0,0.0)",
                        boxShadow:
                          message.role === "user"
                            ? "0 0 8px 2px #00bcd4"
                            : "0 0 8px 2px #ff9800",
                        border:
                          message.role === "user"
                            ? "2px solid #00bcd4"
                            : "2px solid #ff9800",
                      }}
                      src={message.role !== "user" ? "Zoro.jpeg" : undefined}
                    >
                      {message.role === "user"
                        ? `${auth?.user?.name?.[0] || "U"}${
                            auth?.user?.name?.split(" ")[1]?.[0] || ""
                          }`
                        : null}
                    </Avatar>

                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        background:
                          message.role === "user"
                            ? "linear-gradient(90deg, #00bcd4 0%, #181818 100%)"
                            : message.isError
                            ? "rgba(229, 115, 115, 0.2)"
                            : "linear-gradient(90deg, #232526 0%, #2c3e50 100%)",
                        color: "white",
                        borderRadius: 3,
                        border:
                          message.role === "user"
                            ? "1.5px solid #00bcd4"
                            : message.isError
                            ? "1.5px solid #e57373"
                            : "1.5px solid #ff9800",
                        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.4)",
                        maxWidth: "100%",
                      }}
                    >
                      {(() => {
                        const blocks = extractCodeBlocks(message.content);
                        return blocks.map((block, index) =>
                          block.type === "code" ? (
                            <SyntaxHighlighter
                              key={index}
                              style={coldarkDark}
                              language={block.language}
                              wrapLongLines
                            >
                              {block.content}
                            </SyntaxHighlighter>
                          ) : (
                            <Typography 
                              key={index} 
                              sx={{ 
                                fontSize: "16px", 
                                whiteSpace: "pre-line",
                                color: "white" 
                              }}
                            >
                              {block.content}
                            </Typography>
                          )
                        );
                      })()}
                    </Paper>
                  </Box>
                </Box>
              ))
            )}

            {isThinking && (
              <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Avatar
                    src="Zoro.jpeg"
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "#ff9800",
                      boxShadow: "0 0 8px 2px #ff9800",
                      border: "2px solid #ff9800",
                    }}
                  />
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      background:
                        "linear-gradient(90deg, #232526 0%, #2c3e50 100%)",
                      borderRadius: 3,
                      border: "1.5px solid #ff9800",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} color="secondary" />
                      <Typography variant="body2" color="text.secondary">
                        Zoro is thinking...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </Box>

          <Divider sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              background: "rgba(24,24,24,0.95)",
              borderRadius: "0 0 14px 14px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 -2px 8px 0 rgba(0,0,0,0.5)",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                inputRef={inputRef}
                placeholder="Type your message here..."
                variant="filled"
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                sx={{
                  background: "#232526",
                  borderRadius: 3,
                  input: { color: "white" },
                  textarea: { color: "white" },
                  "& .MuiFilledInput-root": {
                    background: "#232526",
                    color: "white",
                  },
                }}
              />
              <IconButton
                onClick={handleSubmit}
                color="primary"
                disabled={isThinking}
                sx={{
                  bgcolor: "#00bcd4",
                  color: "white",
                  ml: 1,
                  boxShadow: "0 2px 8px 0 rgba(0,188,212,0.25)",
                  "&:hover": {
                    bgcolor: "#0097a7",
                  },
                  "&:disabled": {
                    bgcolor: "rgba(0,188,212,0.5)",
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Chat;
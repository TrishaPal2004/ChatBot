import React, { useState, useRef } from "react";
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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { sendChatRequest } from "../helpers/api-communicator";

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

  const handleSubmit = async () => {
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
    const chatData=await sendChatRequest(content);
    setchatMessages([...chatData.chats]);
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a placeholder response.",
        timestamp: new Date(),
      };
      setchatMessages((prev) => [...prev, botMessage]);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ height: "100vh", display: "flex", flexDirection: "row", py: 2 }}
    >
      {/* Left Sidebar */}
      <Box
        sx={{
          width: "25%",
          minWidth: "220px",
          maxWidth: "300px",
          borderRight: "1px solid #e0e0e0",
          pr: 1,
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Chat History
        </Typography>
        <Button sx={{ backgroundColor: "red", color: "white" }}>
          Clear Convo
        </Button>
      </Box>

      {/* Right Main Chat Area */}
      <Box sx={{ flex: 1, pl: 2, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography
            variant="h5"
            component="h1"
            color="black"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <img
              src="/Zoro.jpeg"
              alt="AI Avatar"
              style={{
                borderRadius: "50%",
                width: "45px",
                height: "45px",
                objectFit: "cover",
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
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
            color: "black",
            border: "1px solid rgb(17, 15, 15)",
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
                <Typography variant="h6">Start a conversation!</Typography>
                <Typography variant="body2">
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
                        width: 32,
                        height: 32,
                        bgcolor:
                          message.role === "user"
                            ? "primary.main"
                            : "transparent",
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
                      elevation={1}
                      sx={{
                        p: 2,
                        backgroundColor:
                          message.role === "user"
                            ? "primary.main"
                            : message.isError
                            ? "error.light"
                            : "white",
                        color:
                          message.role === "user" ? "white" : "text.primary",
                        borderRadius: 2,
                        maxWidth: "100%",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {message.content}
                      </Typography>
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
                    sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                  />
                  <Paper
                    elevation={1}
                    sx={{ p: 2, backgroundColor: "white", borderRadius: 2 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Zoro is thinking...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              backgroundColor: "white",
              borderRadius: "0 0 8px 8px",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                inputRef={inputRef}
                placeholder="Type your message here..."
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />
              <IconButton
                onClick={handleSubmit}
                color="primary"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "&:disabled": {
                    bgcolor: "grey.300",
                    color: "grey.500",
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

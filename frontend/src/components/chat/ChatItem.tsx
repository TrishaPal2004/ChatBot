import { Box, Typography, Avatar } from "@mui/material";
import React from "react";
import { useAuth } from "../../context/AuthContext";

const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const auth = useAuth();

  if (role === "assistant") {
    return (
      <Box
        sx={{
          display: "flex",
          p: 2,
          my: 2,
          bgcolor: "#004d5612",
          gap: 2,
          borderRadius: 2,
          alignItems: "flex-start",
        }}
      >
        <Avatar src="/Zoro.jpeg" alt="Assistant Avatar" sx={{ width: 32, height: 32 }} />
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {content}
        </Typography>
      </Box>
    );
  } else {
    const userInitials = `${auth?.user?.name?.[0] || "U"}${
      auth?.user?.name?.split(" ")[1]?.[0] || ""
    }`;

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          p: 2,
          my: 2,
          bgcolor: "primary.main",
          color: "white",
          gap: 2,
          borderRadius: 2,
          alignItems: "flex-start",
        }}
      >
        <Avatar sx={{ width: 32, height: 32 }}>{userInitials}</Avatar>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {content}
        </Typography>
      </Box>
    );
  }
};

export default ChatItem;

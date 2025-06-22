import { Box, Typography, Avatar } from "@mui/material";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// 🧠 Properly extract code blocks with language support
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

const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const auth = useAuth();

  const blocks = extractCodeBlocks(content);

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
        <Box>
          {blocks.map((block, index) =>
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
              <Typography key={index} sx={{ fontSize: "18px", whiteSpace: "pre-line" }}>
                {block.content}
              </Typography>
            )
          )}
        </Box>
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
        <Box>
          <Typography sx={{ fontSize: "18px", whiteSpace: "pre-line" }}>
            {content}
          </Typography>
        </Box>
      </Box>
    );
  }
};

export default ChatItem;

import { Typography } from '@mui/material'
import React from 'react'
import {Link} from "react-router-dom"
import CustomizedInput from './CustomizedInput';
const Logo = () => {
  return (
    <div
      style={{
        display: "flex",
        marginRight: "auto",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <Link to={"/"}>
        <img
          src="/Logo.png"
          alt="openai"
          width={"30px"}
          height={"30px"}
          className="image-inverted"
        />
      </Link>
       <Typography
          sx={{
            display: { md: "block", searchm: "none", sx: "none" },
            mr: "auto",
            fontWeight: "800",
            textShadow: "2px 2px 20px #000",
          }}
        >
          <span style={{ fontSize: "20px" }}>ZORO</span>Talk
        </Typography>
        
    </div>
  );
}

export default Logo;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createTheme,ThemeProvider } from '@mui/material'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import { AuthProvider } from './context/AuthContext.tsx'
import axios from 'axios'
import {Toaster} from "react-hot-toast"
axios.defaults.baseURL="http://localhost:5000/api/v1";
axios.defaults.withCredentials=true;
const theme=createTheme({typography:{fontFamily:"WDXL Lubrifont SC",allVariants:{color:"white"}}})
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
    <BrowserRouter>
    <ThemeProvider theme={theme}>
      <Toaster position="top-right"/>
    <App/>
    </ThemeProvider>
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)

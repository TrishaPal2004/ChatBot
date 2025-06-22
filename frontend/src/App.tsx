import { Routes, Route } from "react-router-dom";
import './App.css'
import Header from './components/Header.tsx'
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

// Add these imports for MUI theming:
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create your black/dark theme:
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#101010',
      paper: '#181818',
    },
    primary: {
      main: '#00bcd4',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff9800',
    },
    error: {
      main: '#e57373',
    },
    text: {
      primary: '#fff',
      secondary: '#b0b0b0',
    },
    divider: 'rgba(255,255,255,0.12)',
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </ThemeProvider>
  );
}

export default App;

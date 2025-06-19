import {Routes,Route} from "react-router-dom";
import './App.css'
import Header from './components/Header.tsx'
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";


function App() {
  
  return(
  <main>
    <Header/>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/chat" element={<Chat/>} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  </main>
  );
}

export default App

import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/App.css";
import "./Login";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Workspace from "./Workspace";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspace" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import "./styles/LandingPage.css";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

  function handleClick() {
    useEffect(() => {
      navigate("/login");
    });
  }

  return (
    <>
      <h1>This is Landing Page !!!</h1>
      <button onClick={handleClick}>
        <Link to="/login">Login</Link>
      </button>
    </>
  );
}

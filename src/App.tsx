import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import InputUI from "./pages/InputUI"; // adjust path if needed
import "./styles/style.css";

const runtimeClientId = window.__ENV__?.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_ID =
  runtimeClientId && runtimeClientId !== "__VITE_GOOGLE_CLIENT_ID__"
    ? runtimeClientId
    : import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function AppRoutes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "create" | "open" | null
  >(null);
  const navigate = useNavigate();

  const openLogin = (action: "create" | "open") => {
    setSelectedAction(action);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLogin = () => {
    setIsModalOpen(false);
    setSelectedAction(null);
    document.body.style.overflow = "";
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeLogin();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeLogin();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <header className="navbar">
              <a href="#" className="logo">
                <img
                  src={import.meta.env.BASE_URL + "images/OhanaLogo.png"}
                  alt="Ohana Family Tree"
                />
              </a>
              <span className="headerCaption">Simplicity.. Creativity...</span>
            </header>

            <main className="details">
              <section className="hero">
                <h1>
                  Lets write
                  <br />
                  your story on the tree
                </h1>
              </section>

              <section className="options">
                <button
                  className="option-card create-card"
                  onClick={() => openLogin("create")}
                >
                  <div className="card-top">
                    <div className="card-icon create-icon">&#43;</div>
                  </div>
                  <div className="card-content">
                    <span className="card-label">BUILD YOUR OHANA</span>
                    <h2>Create a New Tree</h2>
                  </div>
                  <div className="card-footer">
                    <span>Begin here</span>
                    <span>→</span>
                  </div>
                </button>

                <button
                  className="option-card open-card"
                  onClick={() => openLogin("open")}
                >
                  <div className="card-top">
                    <div className="card-icon open-icon">⌂</div>
                  </div>
                  <div className="card-content">
                    <span className="card-label">WELCOME BACK</span>
                    <h2>Open an Existing Tree</h2>
                  </div>
                  <div className="card-footer">
                    <span>Continue building your tree</span>
                    <span>→</span>
                  </div>
                </button>
              </section>
            </main>

            {isModalOpen && (
              <div className="modal-overlay" onClick={handleOverlayClick}>
                <div
                  className="login-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modalTitle"
                >
                  <button
                    className="close-button"
                    onClick={closeLogin}
                    aria-label="Close login dialog"
                  >
                    ×
                  </button>
                  <p className="modal-eyebrow">WELCOME TO OHANA</p>
                  <h2 id="modalTitle">
                    {selectedAction === "create"
                      ? "Create your family tree."
                      : "Welcome back."}
                  </h2>
                  <p id="modalDescription">
                    {selectedAction === "create"
                      ? "Sign in to start."
                      : "Sign in to access your existing family trees."}
                  </p>
                  <div>
                    <GoogleLogin
                      onSuccess={(credentialSuccess) => {
                        console.log("Credential Success!");
                        console.log(credentialSuccess.clientId);
                        closeLogin();
                        navigate("/input");
                      }}
                      onError={() => {
                        console.error("OAuth Credential was not accepted.");
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        }
      />
      {/* TODO: Fix this later so that we can give links for different trees. */}
      <Route path="/input" element={<InputUI />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin({ email, password });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="glass-loader">
          <div className="spinner"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="bg-shapes">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <main>
        <div className="form-container">
          <h1>LOGIN</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email address</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter email"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter password"
              />
            </div>

            <button className="login-btn">
              {loading ? <span className="btn-loader"></span> : "Sign In"}
            </button>
          </form>

          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
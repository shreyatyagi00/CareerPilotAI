import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loading, handleRegister } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({ username, email, password });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="glass-loader">
          <div className="spinner"></div>
          <p>Creating account...</p>
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
          <h1>REGISTER</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="Enter username"
              />
            </div>

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
              {loading ? <span className="btn-loader"></span> : "Create Account"}
            </button>
          </form>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
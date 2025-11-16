import { useState } from "react";
import logo from "./assets/39e82acc7d83121101fd8b44a3a843277ab9e11b.png"; 
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ idCard: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", formData);
    // Add your login logic here
  };

  return (
    <div className="login-container">
      {/* Logo at bottom left */}
      <div className="logo-bottom-left">
        <img src={logo} alt="clinic logo" className="clinic-logo" />
      </div>

      {/* Left section with welcome message */}
      <div className="left-section">
        <h1>welcome</h1>
      </div>

      {/* Right section with login form */}
      <div className="right-section">
        <div className="login-content">
          <h2>log in</h2>
          <p className="description">Enter your credentials to access your account</p>

          <div className="divider"></div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <h3>id card</h3>
              <input
                type="text"
                name="idCard"
                value={formData.idCard}
                onChange={handleChange}
                placeholder="enter your ID card here"
                required
              />
            </div>

            <div className="input-group">
              <h3>password</h3>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="enter your password"
                required
              />
            </div>

            <div className="divider"></div>

            <button type="submit" className="login-btn">
              log in
            </button>
          </form>
        </div>
        
        {/* Copyright positioned under the blue login box */}
        <div className="copyright">copy right version 2025</div>
      </div>
    </div>
  );
};

export default Login;
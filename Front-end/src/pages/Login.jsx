import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/39e82acc7d83121101fd8b44a3a843277ab9e11b.png"; 
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <h3>email</h3>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="enter your email here"
                required
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="divider"></div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "log in"}
            </button>
          </form>
        </div>
        
        <div className="copyright">copy right version 2025</div>
      </div>
    </div>
  );
};

export default Login;  /* Login.css */

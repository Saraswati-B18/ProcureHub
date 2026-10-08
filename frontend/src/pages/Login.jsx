import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck
} from "lucide-react";
import axios from "axios";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const role = response.data.user.role;

      if (role === "SUPER_ADMIN") {
        navigate("/super-admin/companies");
      } else if (role === "COMPANY_ADMIN") {
        navigate("/company-admin/company");
      } else if (role === "EMPLOYEE") {
        navigate("/employee/products");
      } else if (role === "MANAGER") {
        navigate("/manager/approvals");
      } else if (role === "FINANCE") {
        navigate("/finance/invoices");
      } else if (role === "SUPPLIER") {
        navigate("/supplier/products");
      }
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response) {
        setLoginError(
          error.response.data.message || "Invalid email or password."
        );
      } else {
        setLoginError("Unable to connect to the server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <section className="login-intro">
          <div className="intro-glow" />
          <div className="intro-orbit orbit-one" />
          <div className="intro-orbit orbit-two" />

          <div className="intro-content">
            <div className="intro-header">
              <div className="brand">
                <div className="brand-logo">P</div>
                <div>
                  <h1>ProcureHub</h1>
                  <span>B2B Procurement Platform</span>
                </div>
              </div>
              <span className="brand-status">
                <i /> Secure workspace
              </span>
            </div>

            <div className="intro-copy">
              <span className="eyebrow">SMARTER BUSINESS PURCHASING</span>
              <h2>
                Purchase better.
                <br />
                <span>Work smarter.</span>
              </h2>
              <p>
                One connected workspace for requests, approvals, suppliers,
                orders and payments.
              </p>
            </div>

            <div className="workflow-visual" aria-hidden="true">
              <div className="workflow-line">
                <span />
              </div>

              <div className="workflow-node node-active">
                <div className="node-icon"><Check size={13} /></div>
                <strong>Request</strong>
                <small>Create</small>
              </div>

              <div className="workflow-node">
                <div className="node-icon">02</div>
                <strong>Approve</strong>
                <small>Review</small>
              </div>

              <div className="workflow-node">
                <div className="node-icon">03</div>
                <strong>Order</strong>
                <small>Process</small>
              </div>

              <div className="workflow-node">
                <div className="node-icon">04</div>
                <strong>Pay</strong>
                <small>Complete</small>
              </div>
            </div>

            <div className="intro-note">
              <span className="note-line" />
              <span>From purchase request to completed order.</span>
            </div>
          </div>

          <div className="large-p" aria-hidden="true">P</div>
        </section>

        <section className="login-panel">
          <div className="login-form-container">
            <div className="mobile-brand brand">
              <div className="brand-logo">P</div>
              <div>
                <h1>ProcureHub</h1>
                <span>B2B Procurement Platform</span>
              </div>
            </div>

            <div className="form-heading">
              <div className="form-icon">
                <LockKeyhole size={18} />
              </div>
              <span className="form-label">ACCOUNT ACCESS</span>
              <h2>Welcome back</h2>
              <p>Sign in to continue to your ProcureHub workspace.</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-field">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={17} />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="login-password">Password</label>
                <div className="input-wrapper">
                  <LockKeyhole size={17} />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="login-error" role="alert">
                  <span>!</span>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="login-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="security-note">
              <ShieldCheck size={16} />
              <span>Your credentials are securely authenticated.</span>
            </div>

            <div className="form-footer">
              <span>ProcureHub</span>
              <i />
              <span>Procurement management made simple</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;

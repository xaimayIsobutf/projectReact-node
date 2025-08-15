import React, { useState } from "react";
import { signup } from "../api/user";
import "../styles/sign.css";
import logo from "../assets/images/main-logo.png";

const SignupScreen = () => {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSignup = async () => {
    setError(""); setSuccess("");
    if (!name || !email || !password) return setError("ປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
    try {
      setLoading(true);
      await signup(name, email, password);
      setSuccess("ສະໝັກສຳເລັດແລ້ວ!ສາມາດເຂົ້າລະບົບໄດ້");
    } catch (e) {
      setError(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e.message ||
        "Sign up failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-logo"><img src={logo} alt="Logo" /></div>
      <div className="signup-form">
<div className="signup-header">
          <h2 className="signup-header-text">Create Your Account</h2>
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="input-group">
          <label>Name:</label>
          <input value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>

        <button className="signup-button" onClick={handleSignup} disabled={loading}>
          {loading ? "ກຳລັງສະໝັກ....." : "Sign Up"}
        </button>
        <div className="footer">
          <p>Already have an account? <a href="/login">Login</a></p>
          </div>
      </div>
    </div>
  );
};

export default SignupScreen;

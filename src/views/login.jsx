import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logo from "../assets/images/main-logo.png";
import { login } from "../api/user";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!username || !password) {
      setError("กรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    try {
      setLoading(true);
      const { token, user } = await login(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/"); // สำเร็จ → ไปหน้าแรก
    } catch (e) {
      const msg = e?.response?.data?.message || "ເຂົ້າລະບົບບໍ່ໄດ້";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="logo"><img src={logo} alt="Logo" /></div>

      <div className="formContainer">
        <h2 className="formTitle">Login</h2>

        {error && <div className="error">{error}</div>}

        <div className="inputGroup">
          <label>Username:</label>
          <input value={username} onChange={(e)=>setUsername(e.target.value)} />
        </div>

        <div className="inputGroup">
          <label>Password:</label>
          <input type="password" value={password}
                 onChange={(e)=>setPassword(e.target.value)} />
        </div>

        <button className="button" onClick={handleLogin} disabled={loading}>
          {loading ? "ກຳລັງເຂົ້າລະບົບ....." : "Login"}
        </button>
      </div>

      <div className="footer">
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </div>
    </div>
  );
};

export default LoginScreen;

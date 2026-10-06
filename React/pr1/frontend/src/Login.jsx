import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./Authcontext";
import { loginUser } from "./api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Заполните все поля");
    try {
      setLoading(true);
      setError(null);
      const user = await loginUser({ email, password });
      login(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "left" }}>
      <h2>Авторизация</h2>
      {error && <p style={{ color: "red", background: "#fee", padding: "10px" }}>{error}</p>}
      <form onSubmit={handleSubmit} className="product-card">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px", boxSizing: "border-box" }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "15px", padding: "8px", boxSizing: "border-box" }}
        />
        <button type="submit" className="btn" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Загрузка..." : "Войти"}
        </button>
      </form>
    </div>
  );
}

export default Login;
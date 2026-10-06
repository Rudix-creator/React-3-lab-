import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./Authcontext";
import { CartContext } from "./Cartcontext";

function Navbar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { items } = useContext(CartContext);
  const navigate = useNavigate();
  const isAdmin = user?.role_id === 2;
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  };

  const getLinkStyle = ({ isActive }) => ({
    textDecoration: "none",
    fontWeight: isActive ? "bold" : "normal",
    color: isActive ? "#8a2be2" : "inherit", // Фиолетовый цвет при активной странице
    transition: "color 0.2s ease"
  });

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {/* end нужен для того, чтобы главная "/" подсвечивалась только строго на ней */}
        <NavLink to="/" style={getLinkStyle} end>Каталог</NavLink>
        {!isAdmin && (
          <NavLink to="/cart" style={getLinkStyle}>Корзина ({totalCount})</NavLink>
        )}
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {/* Кнопка смены темы */}
        <button 
          onClick={toggleTheme} 
          className="btn" 
          style={{ padding: "6px 12px", fontSize: "14px", cursor: "pointer", borderRadius: "4px" }}
        >
          Переключить тему ({theme})
        </button>

        {isAuthenticated ? (
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <NavLink to="/dashboard" style={getLinkStyle}>Кабинет</NavLink>
            <button className="btn btn-danger" onClick={() => { logout(); navigate("/"); }} style={{ padding: "4px 10px", fontSize: "14px" }}>Выйти</button>
          </div>
        ) : (
          <NavLink to="/login" style={getLinkStyle}>Войти</NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
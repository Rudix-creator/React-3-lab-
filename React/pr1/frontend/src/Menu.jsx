import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./Themecontext";
import { CartContext } from "./Cartcontext";
import { AuthContext } from "./Authcontext";

function Menu() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { itemCount } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);

  const isAdmin = user?.role_id === 2;
  const navLinkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

  return (
    <nav>
      <NavLink to="/" end className={navLinkClass}>Каталог</NavLink>
      
      {/* Корзина не показывается администратору */}
      {!isAdmin && (
        <NavLink to="/cart" className={navLinkClass}>Корзина ({itemCount})</NavLink>
      )}

      {/* Если авторизован - показываем "Кабинет", иначе "Войти" */}
      {!isAuthenticated ? (
        <NavLink to="/login" className={navLinkClass}>Войти</NavLink>
      ) : (
        <NavLink to="/dashboard" className={navLinkClass}>Кабинет</NavLink>
      )}

      <button className="btn" onClick={toggleTheme} style={{ marginLeft: "auto" }}>
        Переключить тему ({theme})
      </button>
    </nav>
  );
}

export default Menu;
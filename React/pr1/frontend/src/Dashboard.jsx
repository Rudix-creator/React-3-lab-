import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./Authcontext";
import { 
  getUsers, getCoupons, assignCoupon, getUserOrders, 
  getCategories, deleteCategory, deleteCoupon, updateCoupon, 
  updateCredentials, createCategory, createCoupon 
} from "./api";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user?.role_id === 2;

  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchCode, setSearchCode] = useState(""); 
  
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [newAddress, setNewAddress] = useState(user?.address || "");

  const [newCatName, setNewCatName] = useState("");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponPercent, setNewCouponPercent] = useState("");

  const loadAdminData = () => {
      Promise.all([getUsers(), getCoupons(), getCategories()]).then(([u, c, cat]) => {
          setUsers(u); setCoupons(c); setCategories(cat);
      });
  };

  useEffect(() => {
    if (user) {
      setNewEmail(user.email || "");
      setNewAddress(user.address || "");
    }
    if (isAdmin) {
      loadAdminData();
    } else if (user) {
      getUserOrders(user.user_id).then(setOrders);
    }
  }, [isAdmin, user]);

  const handleUpdateCredentials = async (e) => {
      e.preventDefault();
      try {
          await updateCredentials(user.user_id, { 
              email: newEmail, 
              password: newPassword, 
              address: newAddress 
          });
          alert("Данные профиля обновлены. Войдите заново.");
          logout(); navigate("/login");
      } catch (err) { alert("Ошибка: " + err.message); }
  };

  const handleAddCategory = async (e) => {
      e.preventDefault();
      if (!newCatName.trim()) return;
      try {
          await createCategory({ category_name: newCatName });
          setNewCatName("");
          loadAdminData();
      } catch (err) { alert(err.message); }
  };

  const handleAddCoupon = async (e) => {
      e.preventDefault();
      if (!newCouponCode.trim() || !newCouponPercent) return;
      try {
          await createCoupon({ code: newCouponCode, discount_percent: Number(newCouponPercent) });
          setNewCouponCode("");
          setNewCouponPercent("");
          loadAdminData();
      } catch (err) { alert(err.message); }
  };

  const handleDeleteCategory = async (id) => {
      if(!window.confirm("Удалить категорию?")) return;
      try { await deleteCategory(id); loadAdminData(); } catch(e) { alert(e.message); }
  };

  const handleDeleteCoupon = async (id) => {
      if(!window.confirm("Удалить купон?")) return;
      try { await deleteCoupon(id); loadAdminData(); } catch(e) { alert(e.message); }
  };

  const handleEditCoupon = async (coupon) => {
      const newCode = prompt("Новый код купона:", coupon.code);
      if (!newCode) return;
      const newDisc = prompt("Новый процент скидки (макс. 99):", coupon.discount_percent);
      if (!newDisc) return;
      try { 
          await updateCoupon(coupon.coupon_id, { code: newCode, discount_percent: Number(newDisc) }); 
          loadAdminData(); 
      } catch(e) { alert(e.message); }
  };

  return (
    <div style={{ padding: "24px", textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
      <h1>{isAdmin ? "Панель администратора" : "Профиль"}</h1>
      
      {/* Смена учетных данных и адреса */}
      <div style={{ background: "var(--code-bg)", padding: "20px", borderRadius: "8px", marginBottom: "24px", display: "inline-block", width: "100%", maxWidth: "500px", textAlign: "left" }}>
          
          {/* Статическое отображение текущего адреса */}
          <div style={{ marginBottom: "16px", padding: "12px", background: "var(--bg)", borderRadius: "6px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "13px", color: "gray", display: "block", marginBottom: "4px" }}>Текущий сохранённый адрес:</span>
              <strong style={{ fontSize: "15px", color: "var(--text)" }}>
                {user?.address ? user.address : "Адрес пока не указан"}
              </strong>
          </div>

          <form onSubmit={handleUpdateCredentials}>
              <h3 style={{ textAlign: "center", marginTop: 0 }}>Изменить учетные данные</h3>
              <div style={{ marginBottom: "10px" }}>
                  <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>Email:</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={{ width: "100%", padding: "6px", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "10px" }}>
                  <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>Пароль:</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: "100%", padding: "6px", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>Основной адрес доставки:</label>
                  <input type="text" value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Введите адрес..." style={{ width: "100%", padding: "6px", boxSizing: "border-box" }} />
              </div>
              <button className="btn" type="submit" style={{ width: "100%" }}>Сохранить изменения</button>
          </form>
      </div>

      {/* История заказов */}
      {!isAdmin && (
        <div style={{ textAlign: "left", marginTop: "20px" }}>
          <h2 style={{ textAlign: "center" }}>История заказов</h2>
          {orders.length === 0 ? <p style={{ textAlign: "center" }}>У вас пока нет заказов.</p> : (
            <ul style={{ paddingLeft: "20px", maxWidth: "600px", margin: "0 auto" }}>
              {orders.map((o, i) => (
                <li key={i} style={{ marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                  <strong>Заказ №{o.user_order_number}</strong> от {new Date(o.appointment_date).toLocaleDateString()}<br/>
                  Состав заказа: <strong>{o.items_summary}</strong><br/>
                  Количество товаров: <strong>{o.total_quantity} шт.</strong> | Общая сумма: <strong style={{ color: "red" }}>{o.total_amount} ₽</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Админ-панель */}
      {isAdmin && (
        <div style={{ marginTop: "30px", borderTop: "1px solid var(--border)", paddingTop: "20px", display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
              
              {/* Категории */}
              <div style={{ width: "280px", background: "var(--code-bg)", padding: "16px", borderRadius: "8px", textAlign: "left" }}>
                  <h3 style={{ textAlign: "center" }}>Категории</h3>
                  <form onSubmit={handleAddCategory} style={{ marginBottom: "15px" }}>
                      <input 
                        placeholder="Новая категория..." 
                        value={newCatName} 
                        onChange={e => setNewCatName(e.target.value)} 
                        style={{ width: "100%", padding: "6px", marginBottom: "8px", boxSizing: "border-box" }}
                      />
                      <button className="btn" style={{ width: "100%" }}>Добавить</button>
                  </form>
                  <ul style={{ paddingLeft: "20px" }}>
                      {categories.map(c => (
                          <li key={c.category_id} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              {c.category_name} 
                              <button className="btn btn-danger" style={{ padding: "2px 6px", fontSize: "12px" }} onClick={() => handleDeleteCategory(c.category_id)}>✕</button>
                          </li>
                      ))}
                  </ul>
              </div>

              {/* Купоны */}
              <div style={{ width: "300px", background: "var(--code-bg)", padding: "16px", borderRadius: "8px", textAlign: "left" }}>
                  <h3 style={{ textAlign: "center" }}>Купоны</h3>
                  <form onSubmit={handleAddCoupon} style={{ marginBottom: "15px" }}>
                      <input 
                        placeholder="Код (например, SALE50)" 
                        value={newCouponCode} 
                        onChange={e => setNewCouponCode(e.target.value)} 
                        style={{ width: "100%", padding: "6px", marginBottom: "8px", boxSizing: "border-box" }}
                      />
                      <input 
                        type="number" 
                        min="1" 
                        max="99" 
                        placeholder="Скидка (%)" 
                        value={newCouponPercent} 
                        onChange={e => setNewCouponPercent(e.target.value)} 
                        style={{ width: "100%", padding: "6px", marginBottom: "8px", boxSizing: "border-box" }}
                      />
                      <button className="btn" style={{ width: "100%" }}>Создать купон</button>
                  </form>
                  <ul style={{ paddingLeft: "0", listStyle: "none" }}>
                      {coupons.map(c => (
                          <li key={c.coupon_id} style={{ marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                              <strong>{c.code}</strong> — {c.discount_percent}%
                              <div style={{ marginTop: "6px" }}>
                                  <button className="btn" style={{ padding: "2px 8px", fontSize: "12px", marginRight: "8px" }} onClick={() => handleEditCoupon(c)}>Изменить</button>
                                  <button className="btn btn-danger" style={{ padding: "2px 8px", fontSize: "12px" }} onClick={() => handleDeleteCoupon(c.coupon_id)}>Удалить</button>
                              </div>
                          </li>
                      ))}
                  </ul>
              </div>

              {/* Выдача купонов */}
              <div style={{ width: "320px", background: "var(--code-bg)", padding: "16px", borderRadius: "8px", textAlign: "left" }}>
                  <h3 style={{ textAlign: "center" }}>Выдача купонов</h3>
                  <input 
                    type="text" 
                    placeholder="Поиск по Email..." 
                    value={searchCode} 
                    onChange={(e) => setSearchCode(e.target.value)} 
                    style={{ width: "100%", padding: "8px", marginBottom: "12px", boxSizing: "border-box" }} 
                  />
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {users.filter(u => u.email.toLowerCase().includes(searchCode.toLowerCase())).map(u => (
                        <tr key={u.user_id}>
                          <td style={{ padding: "8px", border: "1px solid var(--border)", fontSize: "14px" }}>{u.email}</td>
                          <td style={{ padding: "8px", border: "1px solid var(--border)" }}>
                            <select defaultValue={u.coupon_id || ""} onChange={(e) => assignCoupon(u.user_id, e.target.value)} style={{ padding: "4px" }}>
                              <option value="">Без купона</option>
                              {coupons.map(c => <option key={c.coupon_id} value={c.coupon_id}>{c.code} (-{c.discount_percent}%)</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
        </div>
      )}

      <div>
        <button className="btn btn-danger" onClick={() => { logout(); navigate("/"); }} style={{ marginTop: "30px" }}>Выйти из аккаунта</button>
      </div>
    </div>
  );
}

export default Dashboard;
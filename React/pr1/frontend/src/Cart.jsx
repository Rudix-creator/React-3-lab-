import { useContext, useState } from "react";
import { CartContext } from "./Cartcontext";
import { AuthContext } from "./Authcontext";
import { useNavigate, Navigate } from "react-router-dom";

function Cart() {
  const { items, addToCart, decreaseQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  if (user?.role_id === 2) {
      return <Navigate to="/" replace />;
  }

  const userDiscount = user?.coupon_discount ? Number(user.coupon_discount) : 0;

  const calculateFinalPrice = (price, serviceDiscount) => {
      const totalDiscount = Math.min((Number(serviceDiscount) || 0) + userDiscount, 99);
      return (price * (1 - totalDiscount / 100)).toFixed(0);
  };

  const baseTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = items.reduce((sum, item) => sum + (calculateFinalPrice(item.price, item.discount_percent) * item.quantity), 0);
  const totalDiscountAmount = baseTotal - finalTotal;

  const handleCheckout = async () => {
      if (!isAuthenticated) {
          alert("Пожалуйста, авторизуйтесь для оформления заказа.");
          navigate("/login"); return;
      }
      const orderData = {
          user_id: user.user_id,
          items: items.map(item => ({
              service_id: item.service_id, quantity: item.quantity,
              finalPrice: calculateFinalPrice(item.price, item.discount_percent)
          }))
      };
      try {
          const { createOrder } = await import("./api"); 
          const response = await createOrder(orderData);
          setOrderNumber(response.order_id);
          setShowReceipt(true);
      } catch (err) { alert("Ошибка при оформлении: " + err.message); }
  };

  const closeReceipt = () => {
      clearCart();
      navigate("/dashboard");
  };

  return (
    <div style={{ display: "flex", gap: "32px", margin: "24px", flexWrap: "wrap", alignItems: "flex-start", textAlign: "left" }}>
      
      {showReceipt && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
              <div style={{ background: "var(--bg)", padding: "32px", borderRadius: "8px", width: "400px", textAlign: "center", border: "1px solid var(--border)" }}>
                  <h2>Чек об оплате (Заказ №{orderNumber})</h2>
                  <p>Заказ успешно оформлен.</p>
                  <hr style={{ borderColor: "var(--border)", margin: "16px 0" }}/>
                  <p style={{ display: "flex", justifyContent: "space-between" }}><span>Первозданная цена:</span> <span>{baseTotal} ₽</span></p>
                  <p style={{ display: "flex", justifyContent: "space-between", color: "green" }}><span>Скидка:</span> <span>-{totalDiscountAmount} ₽</span></p>
                  <h3 style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}><span>Итого уплачено:</span> <span>{finalTotal} ₽</span></h3>
                  <button className="btn" onClick={closeReceipt} style={{ marginTop: "24px", width: "100%" }}>В личный кабинет</button>
              </div>
          </div>
      )}

      <div style={{ flexGrow: 1, minWidth: "300px" }}>
        <h1 style={{ marginTop: 0 }}>Корзина</h1>
        {isAuthenticated ? (
            <p style={{ color: "green", background: "#efe", padding: "10px", borderRadius:"6px", display: "inline-block" }}>
                Ваша персональная скидка: <strong>{userDiscount}%</strong>
            </p>
        ) : ( <p style={{ color: "var(--text)" }}>Авторизуйтесь, чтобы применить скидки.</p> )}

        {items.length === 0 ? ( <p style={{ fontSize: "18px" }}>Корзина пуста</p> ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
            {items.map((item) => {
              const finalPrice = calculateFinalPrice(item.price, item.discount_percent);
              return (
                <div key={item.service_id} className="cart-row" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <img src={item.image_url || "https://via.placeholder.com/80"} alt={item.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                  <div style={{ flexGrow: 1 }}>
                      <span style={{ fontWeight: "bold", fontSize: "18px" }}>{item.name}</span>
                      <div style={{ fontSize: "14px", color: "var(--text)", marginTop: "4px" }}>
                          Цена за шт: <s>{item.price} ₽</s> | Со скидкой: <strong style={{ color: "red" }}>{finalPrice} ₽</strong>
                      </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--code-bg)", padding: "4px 8px", borderRadius: "6px" }}>
                    <button className="btn" style={{ padding: "4px 10px", margin: 0 }} onClick={() => decreaseQuantity(item.service_id)}>−</button>
                    <span style={{ fontWeight: "bold", minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                    <button className="btn" style={{ padding: "4px 10px", margin: 0 }} onClick={() => addToCart(item)}>+</button>
                  </div>
                  <div style={{ minWidth: "120px", textAlign: "right" }}>
                    <span style={{ fontSize: "13px", color: "var(--text)" }}>{item.quantity} шт. на сумму</span><br/>
                    <strong style={{ fontSize: "18px" }}>{finalPrice * item.quantity} ₽</strong>
                  </div>
                  <button className="btn btn-danger" onClick={() => removeFromCart(item.service_id)}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <aside style={{ width: "320px", flexShrink: 0, padding: "24px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--code-bg)", position: "sticky", top: "24px" }}>
          <h2 style={{ marginTop: 0, borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>Ваш заказ</h2>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "16px 0", color: "var(--text)" }}><span>Товаров:</span><span>{items.reduce((s, i) => s + i.quantity, 0)} шт.</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "16px 0", color: "var(--text)" }}><span>Сумма без скидок:</span><span>{baseTotal} ₽</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "16px 0", color: "green" }}><span>Скидка:</span><span>-{totalDiscountAmount} ₽</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "24px 0", fontSize: "24px", fontWeight: "bold" }}><span>Итого:</span><span>{finalTotal} ₽</span></div>
          <button className="btn" style={{ width: "100%", padding: "16px", background: "var(--accent)", color: "#fff", border: "none", fontSize: "16px", fontWeight: "bold", borderRadius: "6px" }} onClick={handleCheckout}>
            Оформить заказ
          </button>
        </aside>
      )}
    </div>
  );
}

export default Cart;
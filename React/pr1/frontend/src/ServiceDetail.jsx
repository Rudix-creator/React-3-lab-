import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceById } from "./api";
import { CartContext } from "./Cartcontext";
import { AuthContext } from "./Authcontext";

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role_id === 2;

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServiceById(id)
      .then(data => setService(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Загрузка товара...</h2>;
  if (error || !service) return <h2 style={{ textAlign: "center", marginTop: "50px", color: "red" }}>Товар не найден</h2>;

  const finalPrice = Number(service.discount_percent) > 0 
    ? (service.price * (1 - service.discount_percent / 100)).toFixed(0) 
    : service.price;

  const handleBuyNow = () => {
    addToCart(service);
    navigate("/cart");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "24px", textAlign: "left", background: "var(--code-bg)", borderRadius: "12px", border: "1px solid var(--border)" }}>
      <button className="btn" onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>← Назад в каталог</button>
      
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Большая фотография товара (DNS стиль) */}
        <div style={{ flex: "1 1 400px", background: "var(--bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)", textAlign: "center" }}>
          <img 
            src={service.image_url || "https://via.placeholder.com/500x350?text=Нет+фото"} 
            alt={service.name} 
            style={{ width: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "6px" }}
          />
        </div>

        {/* Информация о товаре и кнопка покупки */}
        <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "var(--text)", background: "var(--border)", padding: "4px 8px", borderRadius: "4px", width: "fit-content" }}>
            Категория: <strong>{service.category_name}</strong>
          </span>
          
          <h1 style={{ margin: "0", fontSize: "28px" }}>{service.name}</h1>
          
          <p style={{ fontSize: "16px", color: "var(--text)", lineHeight: "1.5" }}>
            {service.description}
          </p>

          <div style={{ marginTop: "20px", padding: "16px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            {Number(service.discount_percent) > 0 ? (
               <div>
                 <s style={{ color: "gray", fontSize: "16px" }}>{service.price} ₽</s>
                 <div style={{ color: "red", fontSize: "32px", fontWeight: "bold", marginTop: "4px" }}>
                    {finalPrice} ₽ <span style={{ fontSize: "18px" }}>(-{service.discount_percent}%)</span>
                 </div>
               </div>
            ) : (
               <div style={{ fontSize: "32px", fontWeight: "bold" }}>{service.price} ₽</div>
            )}

            {!isAdmin ? (
              <button 
                className="btn" 
                onClick={handleBuyNow} 
                style={{ width: "100%", marginTop: "20px", padding: "14px", fontSize: "18px", background: "var(--accent)", color: "#fff", fontWeight: "bold", borderRadius: "8px" }}
              >
                В корзину
              </button>
            ) : (
              <p style={{ fontStyle: "italic", color: "gray", marginTop: "15px" }}>Режим администратора (покупка недоступна)</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ServiceDetail;
import { useContext, useState } from "react";
import { CartContext } from "./Cartcontext";
import { updateServiceDiscount } from "./api";
import { Link } from "react-router-dom"; 

function ServiceCard({ service, isAdmin, onUpdate }) {
  const { addToCart, decreaseQuantity, getQuantity } = useContext(CartContext);
  const quantity = getQuantity(service.service_id);
  const [editDiscount, setEditDiscount] = useState(service.discount_percent);

  const handleSaveDiscount = async () => {
    try {
       await updateServiceDiscount(service.service_id, editDiscount);
       alert("Скидка успешно обновлена!");
       if (onUpdate) onUpdate(); 
    } catch(e) {
       alert("Ошибка при сохранении скидки");
    }
  };

  const finalPrice = Number(service.discount_percent) > 0 
    ? (service.price * (1 - service.discount_percent / 100)).toFixed(0) 
    : service.price;

  return (
    <div className="product-card" style={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "100%", 
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "16px",
        boxSizing: "border-box"
    }}>
      
      <Link to={`/service/${service.service_id}`} style={{ textDecoration: "none", color: "inherit", flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <img 
            src={service.image_url || "https://via.placeholder.com/250x150?text=Нет+фото"} 
            alt={service.name} 
            style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "6px", marginBottom: "12px" }}
          />
          <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>{service.name}</h3>
          <p style={{ fontSize: "14px", color: "var(--text)", flexGrow: 1, margin: "0 0 16px 0" }}>
              {service.description}
          </p>
      </Link>
      
      <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
        {Number(service.discount_percent) > 0 ? (
           <p style={{ margin: "0 0 10px 0" }}>
             <s style={{color: "gray", fontSize: "14px"}}>{service.price} ₽</s> <br/>
             <strong style={{color: "red", fontSize: "18px"}}>
                {finalPrice} ₽ 
                (-{service.discount_percent}%)
             </strong>
           </p>
        ) : (
           <p style={{ margin: "0 0 10px 0", fontSize: "18px" }}><strong>{service.price} ₽</strong></p>
        )}
        
        {!isAdmin ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                <button className="btn" style={{ flexGrow: 1, padding: "8px" }} onClick={() => addToCart(service)}>
                    В корзину {quantity > 0 && `(${quantity})`}
                </button>
                {quantity > 0 && (
                    <button className="btn" style={{ padding: "8px 12px" }} onClick={() => decreaseQuantity(service.service_id)}>–</button>
                )}
            </div>
        ) : (
            <div style={{ fontSize: "12px", color: "gray", marginBottom: "10px", fontStyle: "italic" }}>
                Режим администратора
            </div>
        )}

        {isAdmin && (
          <div style={{ marginTop: "10px", padding: "8px", background: "var(--accent-bg)", borderRadius: "6px" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "12px", fontWeight: "bold" }}>Скидка на товар (%)</p>
              <div style={{ display: "flex", gap: "5px" }}>
                  <input type="number" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} style={{ width: "50px", padding: "4px" }} min="0" max="99" />
                  <button className="btn" onClick={handleSaveDiscount} style={{ padding: "4px 8px", fontSize: "12px" }}>Ок</button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceCard;
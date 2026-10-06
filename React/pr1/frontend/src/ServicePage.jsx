import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceById } from "./api";
import { CartContext } from "./Cartcontext";

function ServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    getServiceById(id).then(setService).catch(() => alert("Ошибка загрузки"));
  }, [id]);

  if (!service) return <h2 style={{ padding: "24px" }}>Загрузка...</h2>;

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", textAlign: "left" }}>
      <button className="btn" onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}> Назад в каталог</button>
      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
        <img src={service.image_url} alt={service.name} style={{ width: "400px", borderRadius: "8px", objectFit: "cover" }} />
        <div>
          <h1 style={{ marginTop: 0 }}>{service.name}</h1>
          <p style={{ color: "var(--text)" }}>Категория: {service.category_name}</p>
          <p style={{ fontSize: "18px" }}>{service.description}</p>
          <h2 style={{ color: "red" }}>{service.price} ₽</h2>
          <button className="btn" style={{ padding: "12px 24px", fontSize: "18px" }} onClick={() => addToCart(service)}>
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServicePage;
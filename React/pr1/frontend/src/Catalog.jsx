import { useEffect, useState, useContext } from "react";
import { getServices, getCategories } from "./api";
import { AuthContext } from "./Authcontext";
import ServiceCard from "./ServiceCard";

function Catalog() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role_id === 2;

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCatalogData = () => {
    Promise.all([getServices(), getCategories()])
      .then(([srvData, catData]) => {
        setServices(srvData);
        setCategories(catData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  const handleCategoryToggle = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const filteredServices = services.filter((s) => {
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(s.category_id);
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <h1>Загрузка данных...</h1>;

  return (
    <div style={{ display: "flex", gap: "24px", margin: "24px", textAlign: "left", alignItems: "flex-start", flexWrap: "nowrap" }}>
      
      {/* Боковая панель (Aside) с поиском и фильтрами */}
      <aside style={{ width: "250px", flexShrink: 0, borderRight: "1px solid var(--border)", paddingRight: "20px" }}>
        <h3>Поиск</h3>
        <input 
          type="text"
          placeholder="Найти услугу или товар..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "20px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid var(--border)" }}
        />

        <h3>Категории</h3>
        {categories.map((c) => (
          <label key={c.category_id} style={{ display: "block", marginBottom: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(c.category_id)}
              onChange={() => handleCategoryToggle(c.category_id)}
              style={{ marginRight: "8px" }}
            />
            {c.category_name}
          </label>
        ))}
      </aside>

      {/* Основной контент */}
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ marginTop: 0 }}>Услуги</h2>
          {error && <p style={{ color: "red" }}>Ошибка: {error}</p>}
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {filteredServices.map((s) => (
            <ServiceCard key={s.service_id} service={s} isAdmin={isAdmin} onUpdate={loadCatalogData} />
          ))}
        </div>
        
        {filteredServices.length === 0 && (
            <p>По вашему запросу ничего не найдено.</p>
        )}
      </div>
    </div>
  );
}

export default Catalog;
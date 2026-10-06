import { useState, useEffect } from "react";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  description: "",
  image_url: "",
  stock_quantity: "",
};

function ProductForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        category: initialData.category ?? "",
        price: initialData.price ?? "",
        description: initialData.description ?? "",
        image_url: initialData.image_url ?? "",
        stock_quantity: initialData.stock_quantity ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="product-card"
      style={{ maxWidth: "400px", margin: "0 auto 20px" }}
    >
      <h3>{isEditing ? `Редактирование #${initialData.product_id}` : "Новый товар"}</h3>

      <input
        placeholder="Название"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        style={{ display: "block", width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <input
        placeholder="Категория"
        name="category"
        value={form.category}
        onChange={handleChange}
        style={{ display: "block", width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <input
        placeholder="Цена"
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        required
        min="0"
        style={{ display: "block", width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <input
        placeholder="Количество на складе"
        type="number"
        name="stock_quantity"
        value={form.stock_quantity}
        onChange={handleChange}
        min="0"
        style={{ display: "block", width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <input
        placeholder="Ссылка на изображение"
        name="image_url"
        value={form.image_url}
        onChange={handleChange}
        style={{ display: "block", width: "100%", marginBottom: "8px", padding: "6px" }}
      />
      <textarea
        placeholder="Описание"
        name="description"
        value={form.description}
        onChange={handleChange}
        style={{ display: "block", width: "100%", marginBottom: "8px", padding: "6px" }}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="submit" className="btn">
          {isEditing ? "Сохранить" : "Создать"}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
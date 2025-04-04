import { useState, useEffect } from "react";
import DrinkCard from "../../components/DrinkCard/DrinkCard";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Menu() {
  const [drinks, setDrinks] = useState([]);
  const [filteredDrinks, setFilteredDrinks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const baseURL = "http://127.0.0.1:8000";

    fetch("http://127.0.0.1:8000/api/bartoyou/consumptions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const drinksWithFullImageURL = data.data.map((drink) => ({
          ...drink,
          image_url: `${baseURL}${drink.image_url}`,
        }));
        setDrinks(drinksWithFullImageURL);
        setFilteredDrinks(drinksWithFullImageURL);
      })
      .catch((error) => console.error("Error al obtener datos:", error));
  }, []);

  useEffect(() => {
    let filtered = drinks;
    if (search) {
      filtered = filtered.filter((drink) =>
        drink.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter(
        (drink) => drink.category_id.toString() === category
      );
    }
    setFilteredDrinks(filtered);
  }, [search, category, drinks]);

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f7fafc",
    padding: "24px",
  };

  return (
    <div style={containerStyle}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#e53e3e",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        Menú de Bebidas
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 15px",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            width: "60%", // Ajusta este valor según necesites
          }}
        >
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "12px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              width: "200px", // Ancho fijo para los inputs
            }}
          />

          <input
            type="text"
            placeholder="Filtrar por categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: "12px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              width: "200px", // Ancho fijo para los inputs
            }}
          />
        </div>

        <button
          onClick={() => navigate("/carrito")} // Ajusta la ruta según tu configuración
          style={{
            padding: "12px 20px",
            backgroundColor: "#e53e3e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c53030")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e53e3e")}
        >
          <FaShoppingCart />
          Ir al Carrito
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 15px",
        }}
      >
        {filteredDrinks.map((drink) => (
          <DrinkCard key={drink.id} drink={drink} />
        ))}
      </div>
    </div>
  );
}
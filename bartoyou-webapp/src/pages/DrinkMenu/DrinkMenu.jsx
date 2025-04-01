import { useState, useEffect } from "react";
//import "./Menu.css"; // Importamos los estilos CSS

export default function Menu() {
  const [drinks, setDrinks] = useState([]);
  const [filteredDrinks, setFilteredDrinks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

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
      filtered = filtered.filter((drink) =>
        drink.category_id.toString() === category
      );
    }
    setFilteredDrinks(filtered);
  }, [search, category, drinks]);

  return (
    <div className="menu-container">
      <h1 className="menu-title">Menú</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrar por categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div className="menu-grid">
        {filteredDrinks.map((drink) => (
          <div key={drink.id} className="menu-item">
            <div className="image-container">
              <img src={drink.image_url} alt={drink.name} className="drink-image" />
            </div>
            <div className="card-content">
              <h2 className="drink-name">{drink.name}</h2>
              <p className="drink-description">Descripción del cóctel</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
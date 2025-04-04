import { useState, useEffect } from "react";
import { FaShoppingCart, FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DrinkCard from "../../components/DrinkCard/DrinkCard";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import "./DrinkMenu.css";

export default function Menu() {
  const [drinks, setDrinks] = useState([]);
  const [filteredDrinks, setFilteredDrinks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [view, setView] = useState("categories");
  const navigate = useNavigate();

  // Categorías definidas en frontend con imágenes locales
  const drinkCategories = [
    { 
      id: 1, 
      name: "Cócteles", 
      image_url: "/images/categories/cocktails.jpg",
      description: "Mezclas creativas con alcohol"
    },
    { 
      id: 2, 
      name: "Bebidas con Alcohol", 
      image_url: "/images/categories/alcoholic.jpg",
      description: "Licores y bebidas espirituosas"
    },
    { 
      id: 3, 
      name: "Bebidas sin Alcohol", 
      image_url: "/images/categories/non-alcoholic.jpg",
      description: "Refrescantes y sin alcohol"
    },
    { 
      id: 4, 
      name: "Digestivos", 
      image_url: "/images/categories/digestives.jpg",
      description: "Para después de comer"
    },
    { 
      id: 5, 
      name: "Aguas", 
      image_url: "/images/categories/waters.jpg",
      description: "Minerales y sabores"
    },
    { 
      id: 6, 
      name: "Zumos", 
      image_url: "/images/categories/juices.jpg",
      description: "Naturales y recién exprimidos"
    },
    { 
      id: 7, 
      name: "Batidos", 
      image_url: "/images/categories/smoothies.jpg",
      description: "Cremosos y deliciosos"
    }
  ];

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
    
    if (selectedCategory) {
      filtered = filtered.filter(
        (drink) => drink.category_id.toString() === selectedCategory.id.toString()
      );
    }
    
    setFilteredDrinks(filtered);
  }, [search, selectedCategory, drinks]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setView("drinks");
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setView("categories");
    setSearch("");
  };

  return (
    <div className="menu-container">
      <h1 className="menu-title">
        {view === "categories" ? "Categorías de Bebidas" : selectedCategory?.name}
      </h1>

      <div className="menu-actions">
        {view === "drinks" && (
          <button
            onClick={handleBackToCategories}
            className="back-button"
          >
            <FaChevronLeft />
            Volver
          </button>
        )}

        {view === "drinks" && (
          <input
            type="text"
            placeholder="Buscar bebidas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        )}

        <button
          onClick={() => navigate("/carrito")}
          className="cart-button"
        >
          <FaShoppingCart />
          Ir al Carrito
        </button>
      </div>

      <div className={`items-grid ${view}-view`}>
        {view === "categories" ? (
          drinkCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => handleCategorySelect(category)}
            />
          ))
        ) : (
          filteredDrinks.map((drink) => (
            <DrinkCard key={drink.id} drink={drink} />
          ))
        )}
      </div>
    </div>
  );
}
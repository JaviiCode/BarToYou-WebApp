import { useState, useEffect } from "react";
import { FaShoppingCart, FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DrinkCard from "../../components/DrinkCard/DrinkCard";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import styles from "./DrinkMenu.module.css";
import coctelesImg from "../../assets/DrinkCategory/1.png";
import alcoholicosImg from "../../assets/DrinkCategory/2.png";
import sinAlcoholImg from "../../assets/DrinkCategory/3.png";
import digestivosImg from "../../assets/DrinkCategory/4.png";
import aguasImg from "../../assets/DrinkCategory/5.png";
import zumosImg from "../../assets/DrinkCategory/6.png";
import batidosImg from "../../assets/DrinkCategory/7.png";
import energyImg from "../../assets/DrinkCategory/8.png";

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
            name: "Cócteles clásicos",
            image_url: coctelesImg,
            description: "Combinaciones tradicionales con alcohol, elegantes y atemporales.",
        },
        {
            id: 2,
            name: "Cócteles sin alcohol",
            image_url: alcoholicosImg,
            description: "Bebidas creativas y refrescantes sin contenido alcohólico.",
        },
        {
            id: 3,
            name: "Destilados y licores",
            image_url: sinAlcoholImg,
            description: "Licores y bebidas espirituosas de gran carácter y tradición.",
        },
        {
            id: 4,
            name: "Cervezas",
            image_url: digestivosImg,
            description: "Variedad de cervezas artesanales e industriales para todos los gustos.",
        },
        {
            id: 5,
            name: "Vinos y espumantes",
            image_url: aguasImg,
            description: "Selección de vinos tintos, blancos y espumantes para cada ocasión.",
        },
        {
            id: 6,
            name: "Bebidas calientes",
            image_url: zumosImg,
            description: "Cafés, tés e infusiones para disfrutar en cualquier momento.",
        },
        {
            id: 7,
            name: "Refrescos",
            image_url: batidosImg,
            description: "Bebidas carbonatadas y no alcohólicas, perfectas para calmar la sed.",
        },
        {
            id: 8,
            name: "Bebidas energéticas",
            image_url: energyImg,
            description: "Estimulantes y revitalizantes para aumentar tu energía al instante.",
        },
    ];


    useEffect(() => {
        const token = localStorage.getItem("token");
        const baseURL = `${process.env.REACT_APP_API_URL}`;

        fetch(`${process.env.REACT_APP_API_URL}/api/bartoyou/consumptions`, {
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
        console.log("Drinks from API:", drinks);
    }, [drinks]);

    useEffect(() => {
        let filtered = drinks;

        if (search) {
            filtered = filtered.filter((drink) =>
                drink.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(
                (drink) =>
                    drink.category_id.toString() === selectedCategory.id.toString()
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
        <div className={styles.menuContainer}>

            <h1 className={styles.menuTitle}>
                {view === "categories" ? "Categorías de Bebidas" : selectedCategory?.name}
            </h1>

            <div className={styles.menuActions}>
                {view === "drinks" && (
                    <button
                        onClick={handleBackToCategories}
                        className={styles.backButton}
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
                        className={styles.searchInput}
                    />
                )}

                <button
                    onClick={() => navigate("/Carry")}
                    className={styles.cartButton}
                >
                    <FaShoppingCart />
                    Ir al Carrito
                </button>
            </div>

            <div className={`${styles.itemsGrid} ${styles[`${view}View`]}`}>
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

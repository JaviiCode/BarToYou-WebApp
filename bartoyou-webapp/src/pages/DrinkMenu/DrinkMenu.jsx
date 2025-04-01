import React, { useState, useEffect } from "react";
import DrinkList from "../../components/DrinkList";

const DrinkMenu = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/drinks") // Ajusta la URL según tu backend
      .then((response) => response.json())
      .then((data) => {
        setDrinks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching drinks:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Carta de Bebidas</h1>
      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : (
        <DrinkList drinks={drinks} />
      )}
    </div>
  );
};

export default DrinkMenu;

import React, { useState } from 'react';
import { FaShoppingCart } from "react-icons/fa";
import { useCookies } from 'react-cookie';
import './DrinkCard.css';

const DrinkCard = ({ drink }) => {
  const [cookies, setCookie] = useCookies(['cart']);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const addToCart = () => {
    setIsAdding(true);
    
    const currentCart = cookies.cart || [];
    const existingItemIndex = currentCart.findIndex(item => item.id === drink.id);
    
    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({
        id: drink.id,
        name: drink.name,
        image: drink.image_url,
        quantity: 1
      });
    }
    
    setCookie('cart', currentCart, { path: '/', maxAge: 604800 });
    
    setTimeout(() => {
      setIsAdding(false);
      setShowModal(false);
    }, 1000);
  };

  return (
    <div className={`drink-card ${isAdding ? '' : 'drink-card-hover'}`}>
      <button 
        className="cart-button"
        onClick={() => setShowModal(true)}
        aria-label="Añadir al carrito"
      >
        <FaShoppingCart className="cart-icon" />
      </button>

      <div className="image-container">
        <img src={drink.image_url} alt={drink.name} className="drink-image" />
      </div>
      
      <div className="card-content">
        <h2 className="drink-title">{drink.name}</h2>
        <p className="drink-description">
          {drink.description || "Descripción del cóctel"}
        </p>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Añadir {drink.name} al carrito?</h3>
            <p>{drink.description || "Bebida especial"}</p>
            <div className="modal-buttons">
              <button 
                onClick={() => setShowModal(false)}
                className="cancel-button"
              >
                Cancelar
              </button>
              <button 
                onClick={addToCart}
                className="confirm-button"
                disabled={isAdding}
              >
                {isAdding ? 'Añadiendo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="added-effect">
          <FaShoppingCart className="cart-icon-effect" />
          <span>¡Añadido!</span>
        </div>
      )}
    </div>
  );
};

export default DrinkCard;

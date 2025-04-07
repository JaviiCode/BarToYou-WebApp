import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import './Carry.css';

const Carry = () => {
  const [cookies, , removeCookie] = useCookies(['cart']);
  const [cartItems, setCartItems] = useState([]);
  const [hasAlcoholicDrinks, setHasAlcoholicDrinks] = useState(false);

  useEffect(() => {
    if (cookies.cart) {
      // Filtramos items válidos que tengan al menos id y name
      const validItems = cookies.cart.filter(item => item && item.id && item.name);
      setCartItems(validItems);
      
      // Verificar si hay bebidas alcohólicas
      const alcoholic = validItems.some(item => 
        item.name.toLowerCase().includes('alcohólic') || 
        item.name.toLowerCase().includes('alcohol') ||
        item.name.toLowerCase().includes('cerveza') ||
        item.name.toLowerCase().includes('vino') ||
        item.name.toLowerCase().includes('licor')
      );
      setHasAlcoholicDrinks(alcoholic);
    }
  }, [cookies.cart]);

  const handlePlaceOrder = () => {
    if (hasAlcoholicDrinks) {
      const isAdult = window.confirm("Hay bebidas alcohólicas en tu pedido. ¿Eres mayor de 18 años?");
      if (!isAdult) {
        alert("Pedido cancelado. Debes ser mayor de edad para comprar bebidas alcohólicas.");
        return;
      }
    }
    
    alert("Pedido realizado con éxito!");
    removeCookie('cart', { path: '/' });
    setCartItems([]);
  };

  return (
    <div className="carry-container">
      <h1 className="carry-title">Mi Carrito</h1>
      
      <div className="cart-items-container">
        {cartItems.length > 0 ? (
          <>
            <ul className="cart-items-list">
              {cartItems.map((item, index) => (
                <li key={index} className="cart-item">
                  {item.image && (
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    {item.quantity && <p>Cantidad: {item.quantity}</p>}
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="cart-summary">
              <button 
                onClick={handlePlaceOrder}
                className="place-order-btn"
              >
                Realizar Pedido
              </button>
            </div>
          </>
        ) : (
          <p className="empty-cart-message">Tu carrito está vacío</p>
        )}
      </div>
    </div>
  );
};

export default Carry;
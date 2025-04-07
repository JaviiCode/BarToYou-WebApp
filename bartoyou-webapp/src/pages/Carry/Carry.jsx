import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import './Carry.css';

const Carry = () => {
  const [cookies, , removeCookie] = useCookies(['cart']);
  const [cartItems, setCartItems] = useState([]);
  const [hasAlcoholicDrinks, setHasAlcoholicDrinks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handlePlaceOrder = async () => {
    if (hasAlcoholicDrinks) {
      const isAdult = window.confirm("Hay bebidas alcohólicas en tu pedido. ¿Eres mayor de 18 años?");
      if (!isAdult) {
        alert("Pedido cancelado. Debes ser mayor de edad para comprar bebidas alcohólicas.");
        return;
      }
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    
    try {
      // Enviar cada item del carrito como una orden separada
      const orderPromises = cartItems.map(item => {
        const orderData = {
          member_id: 3, // Esto debería venir de la sesión del usuario
          consumption_id: item.id,
          quantity: item.quantity || 1,
          status_id: 1 // Estado inicial (pendiente)
        };

        return fetch("http://127.0.0.1:8000/api/bartoyou/orders/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });
      });

      // Esperar a que todas las peticiones se completen
      const responses = await Promise.all(orderPromises);
      const results = await Promise.all(responses.map(res => res.json()));

      // Verificar si todas las órdenes fueron exitosas
      const allSuccess = results.every(result => result.success !== false);
      
      if (allSuccess) {
        alert("¡Pedido realizado con éxito!");
        // Limpiar el carrito
        removeCookie('cart', { path: '/' });
        setCartItems([]);
      } else {
        throw new Error("Algunos items no pudieron ser procesados");
      }
    } catch (error) {
      console.error("Error al realizar el pedido:", error);
      alert("Ocurrió un error al procesar tu pedido. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Realizar Pedido'}
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
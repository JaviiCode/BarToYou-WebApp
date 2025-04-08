import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import './Carry.css';
import { FaTrash, FaEdit, FaCheck } from 'react-icons/fa';

const Carry = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['cart']);
  const [cartItems, setCartItems] = useState([]);
  const [hasAlcoholicDrinks, setHasAlcoholicDrinks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);

  useEffect(() => {
    if (cookies.cart) {
      const validItems = cookies.cart.filter(item => item && item.id && item.name);
      setCartItems(validItems);
      
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

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCookie('cart', updatedCart, { path: '/' });
    setCartItems(updatedCart);
  };

  const handleEditQuantity = (item) => {
    setEditingItem(item.id);
    setEditQuantity(item.quantity);
  };

  const handleSaveQuantity = () => {
    const updatedCart = cartItems.map(item => 
      item.id === editingItem ? { ...item, quantity: editQuantity } : item
    );
    setCookie('cart', updatedCart, { path: '/' });
    setCartItems(updatedCart);
    setEditingItem(null);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 5) {
      setEditQuantity(value);
    }
  };

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
      const orderPromises = cartItems.map(item => {
        const orderData = {
          member_id: 3,
          consumption_id: item.id,
          quantity: item.quantity,
          status_id: 1
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

      const responses = await Promise.all(orderPromises);
      const results = await Promise.all(responses.map(res => res.json()));

      const allSuccess = results.every(result => result.success !== false);
      
      if (allSuccess) {
        alert("¡Pedido realizado con éxito!");
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
              {cartItems.map((item) => (
                <li key={item.id} className="cart-item">
                  {item.image && (
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    {editingItem === item.id ? (
                      <div className="quantity-edit">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={editQuantity}
                          onChange={handleQuantityChange}
                        />
                        <button 
                          onClick={handleSaveQuantity}
                          className="save-quantity-btn"
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <p>Cantidad: {item.quantity}</p>
                    )}
                  </div>
                  <div className="item-actions">
                    <button 
                      onClick={() => handleEditQuantity(item)}
                      className="edit-btn"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="remove-btn"
                    >
                      <FaTrash />
                    </button>
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
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import styles from './Carry.module.css';
import { FaTrash, FaEdit, FaCheck } from 'react-icons/fa';
import Alert from "../../components/Alert/Alert";

const Carry = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['cart']);
  const [cartItems, setCartItems] = useState([]);
  const [hasAlcoholicDrinks, setHasAlcoholicDrinks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    onConfirm: null,
    showCancel: true
  });

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

  const showCustomAlert = (title, message, onConfirm, showCancel = true) => {
    setAlertConfig({
      title,
      message,
      onConfirm,
      showCancel
    });
    setShowAlert(true);
  };

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
      showCustomAlert(
        "Verificación de edad",
        "Hay bebidas alcohólicas en tu pedido. ¿Eres mayor de 18 años?",
        () => proceedWithOrder(),
        true
      );
      return;
    }
    await proceedWithOrder();
  };

  const proceedWithOrder = async () => {
    setIsSubmitting(true);
    setError(null);
    const token = localStorage.getItem("token");
    
    try {
      const userData = localStorage.getItem("user");
      let memberId = 0;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          memberId = user.id || 0;
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      if (memberId === 0) {
        throw new Error("No se pudo obtener el ID del usuario");
      }

      const orderPromises = cartItems.map(item => {
        const orderData = {
          member_id: memberId,
          consumption_id: item.id,
          quantity: item.quantity,
          status_id: 1
        };

        return fetch(`${process.env.REACT_APP_API_URL}/api/bartoyou/orders/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });
      });

      const responses = await Promise.all(orderPromises);
      
      const allOk = responses.every(res => res.ok);
      
      if (!allOk) {
        const errorResponses = await Promise.all(
          responses.map(res => res.text().then(text => ({ status: res.status, text })))
        );
        console.error("Error responses:", errorResponses);
        throw new Error("Algunas peticiones fallaron");
      }

      const results = await Promise.all(responses.map(res => res.json()));
      console.log("Order results:", results);

      const allSuccess = results.every(result => result.success !== false);
      
      if (allSuccess) {
        showCustomAlert(
          "¡Éxito!",
          "Pedido realizado con éxito",
          () => {
            removeCookie('cart', { path: '/' });
            setCartItems([]);
          },
          false
        );
      } else {
        throw new Error("Algunos items no pudieron ser procesados");
      }
    } catch (error) {
      console.error("Error al realizar el pedido:", error);
      showCustomAlert(
        "Error",
        "Error al procesar el pedido. Verifica tu conexión o intenta más tarde.",
        null,
        false
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.carryContainer}>
      <h1 className={styles.carryTitle}>Mi Carrito</h1>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.cartItemsContainer}>
        {cartItems.length > 0 ? (
          <>
            <ul className={styles.cartItemsList}>
              {cartItems.map((item) => (
                <li key={item.id} className={styles.cartItem}>
                  {item.image && (
                    <div className={styles.itemImage}>
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    {editingItem === item.id ? (
                      <div className={styles.quantityEdit}>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={editQuantity}
                          onChange={handleQuantityChange}
                        />
                        <button 
                          onClick={handleSaveQuantity}
                          className={styles.saveQuantityBtn}
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <p>Cantidad: {item.quantity}</p>
                    )}
                  </div>
                  <div className={styles.itemActions}>
                    <button 
                      onClick={() => handleEditQuantity(item)}
                      className={styles.editBtn}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className={styles.removeBtn}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className={styles.cartSummary}>
              <button 
                onClick={handlePlaceOrder}
                className={styles.placeOrderBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Realizar Pedido'}
              </button>
            </div>
          </>
        ) : (
          <p className={styles.emptyCartMessage}>Tu carrito está vacío</p>
        )}
      </div>

      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        showCancel={alertConfig.showCancel}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Carry;
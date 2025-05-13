import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronDown, FaChevronUp, FaSave } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./OrderDetails.module.css";
import Alert from "../../components/Alert/Alert";

export default function OrderDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: false
  });

  const showCustomAlert = (title, message, type = 'info', onConfirm = null, showCancel = false) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm,
      showCancel
    });
    setShowAlert(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
	const ordersResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })

	const statusesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/bartoyou/order-statuses`, {
            headers: { Authorization: `Bearer ${token}` }
          })

        if (!ordersResponse.ok) throw new Error("Error al obtener pedidos");
        if (!statusesResponse.ok) throw new Error("Error al obtener estados");

        const ordersData = await ordersResponse.json();
        const statusesData = await statusesResponse.json();

        setAllOrders(ordersData);
        setStatuses(statusesData.data || statusesData);
      } catch (error) {
        console.error("Error:", error);
        showCustomAlert(
          "Error",
          error.message,
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const activeOrders = allOrders.filter(order => {
      const statusId = statuses.find(s => s.name === order.status)?.id;
      return showCompleted ? true : statusId !== 3;
    });
    setFilteredOrders(activeOrders);
  }, [allOrders, statuses, showCompleted]);

  const formatDateTime = (dateTime) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateTime).toLocaleDateString("es-ES", options);
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleStatusChange = (orderId, newStatusId) => {
    setAllOrders(allOrders.map(order => 
      order.orderid === orderId ? { ...order, status_id: parseInt(newStatusId) } : order
    ));
  };

  const saveStatusChange = async (orderId) => {
    const token = localStorage.getItem("token");
    const orderToUpdate = allOrders.find(order => order.orderid === orderId);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bartoyou/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status_id: orderToUpdate.status_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el estado");
      }

      const updatedOrders = allOrders.map(order => 
        order.orderid === orderId ? { 
          ...order, 
          status: statuses.find(s => s.id === orderToUpdate.status_id)?.name 
        } : order
      );

      setAllOrders(updatedOrders);
      setEditingStatus(null);
      
      showCustomAlert(
        "Éxito",
        "Estado del pedido actualizado correctamente",
        "success"
      );
    } catch (error) {
      console.error("Error:", error);
      showCustomAlert(
        "Error",
        "Error al actualizar: " + error.message,
        "error"
      );
      setAllOrders([...allOrders]);
    }
  };

  const startEditing = (orderId) => {
    setEditingStatus(orderId);
  };

  const renderOrderContent = (order) => {
    return order.items?.map((item, index) => (
      <div 
        key={index} 
        className={`${styles.orderItem} ${order.custom_drink_id ? styles.customDrink : styles.standardDrink}`}
      >
        <div className={styles.itemHeader}>
          <h2 className={styles.itemName}>
            {item.name}
            {order.custom_drink_id && (
              <span className={styles.customBadge}>Personalizada</span>
            )}
          </h2>
          
          {item.image_url && (
            <div className={styles.itemImageContainer}>
              <img 
                src={item.image_url} 
                alt={item.name}
                className={styles.itemImage}
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>

        {item.description && (
          <p className={styles.itemDescription}>{item.description}</p>
        )}

        {item.ingredients?.length > 0 && (
          <div className={styles.ingredientsSection}>
            <h3 className={styles.ingredientsTitle}>
              <span>Ingredientes</span>
            </h3>
            <ul className={styles.ingredientsList}>
              {item.ingredients.map((ingredient, idx) => (
                <li key={idx} className={styles.ingredientItem}>
                  <div className={styles.ingredientInfo}>
                    {ingredient.image_url && (
                      <img 
                        src={ingredient.image_url} 
                        alt={ingredient.ingredient}
                        className={styles.ingredientImage}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <span className={styles.ingredientName}>{ingredient.ingredient}</span>
                  </div>
                  <span className={styles.ingredientAmount}>{ingredient.amount} ml</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ));
  };

  if (loading) return <div className={styles.loadingMessage}>Cargando pedidos...</div>;
  if (!allOrders.length) return <div className={styles.noOrderMessage}>No se encontraron pedidos</div>;

  return (
    <div className={styles.orderDetailsContainer}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <FaChevronLeft /> Volver
      </button>

      <h1 className={styles.orderDetailsTitle}>Historial de Pedidos</h1>

      <div className={styles.toggleCompleted}>
        <label>
          <input 
            type="checkbox" 
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)} 
          />
          Mostrar pedidos finalizados
        </label>
      </div>

      <div className={styles.ordersList}>
        {filteredOrders.map((order) => {
          const statusId = statuses.find(s => s.name === order.status)?.id;
          const isCustom = order.custom_drink_id !== null;
          
          return (
            <div 
              key={order.orderid} 
              className={`${styles.orderCard} ${expandedOrder === order.orderid ? styles.expanded : ''}`}
            >
              <div className={styles.orderHeader}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>
                    {isCustom ? `Bebida Personalizada ${order.custom_drink_id}` : `Pedido #${order.orderid}`}
                  </span>
                  <span className={styles.orderDate}>{formatDateTime(order.date_time)}</span>
                  
                  {editingStatus === order.orderid ? (
                    <div className={styles.statusEditContainer}>
                      <select
                        value={statusId}
                        onChange={(e) => handleStatusChange(order.orderid, e.target.value)}
                        className={styles.statusSelect}
                      >
                        {statuses.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                      <button 
                        onClick={() => saveStatusChange(order.orderid)}
                        className={styles.saveStatusButton}
                      >
                        <FaSave /> Guardar
                      </button>
                    </div>
                  ) : (
                    <span 
                      className={`${styles.orderStatus} ${styles[`status${order.status.replace(/\s/g, '')}`]}`}
                      onClick={() => startEditing(order.orderid)}
                    >
                      {order.status}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => toggleOrderDetails(order.orderid)}
                  className={styles.toggleDetailsButton}
                >
                  {expandedOrder === order.orderid ? (
                    <>
                      <FaChevronUp /> Ocultar
                    </>
                  ) : (
                    <>
                      <FaChevronDown /> Ver detalles
                    </>
                  )}
                </button>
              </div>

              <div className={`${styles.orderContent} ${expandedOrder === order.orderid ? styles.orderContentShow : ''}`}>
                {renderOrderContent(order)}
              </div>
            </div>
          );
        })}
      </div>

      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        showCancel={alertConfig.showCancel}
        confirmText="Aceptar"
        cancelText="Cancelar"
        type={alertConfig.type}
      />
    </div>
  );
}

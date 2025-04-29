import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronDown, FaChevronUp, FaSave } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const [ordersResponse, statusesResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/orders/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://127.0.0.1:8000/api/bartoyou/order-statuses", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!ordersResponse.ok) throw new Error("Error al obtener pedidos");
        if (!statusesResponse.ok) throw new Error("Error al obtener estados");

        const ordersData = await ordersResponse.json();
        const statusesData = await statusesResponse.json();

        setAllOrders(ordersData);
        setStatuses(statusesData.data || statusesData);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
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
      const response = await fetch(`http://127.0.0.1:8000/api/bartoyou/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status_id: orderToUpdate.status_id
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar el estado");

      const updatedOrders = allOrders.map(order => 
        order.orderid === orderId ? { 
          ...order, 
          status: statuses.find(s => s.id === orderToUpdate.status_id)?.name 
        } : order
      );

      setAllOrders(updatedOrders);
      setEditingStatus(null);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al actualizar: " + error.message);
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
        className={`order-item ${order.custom_drink_id ? 'custom-drink' : 'standard-drink'}`}
      >
        {/* Encabezado con nombre y tipo de bebida */}
        <div className="item-header">
          <h2 className="item-name">
            {item.name}
            {order.custom_drink_id}
          </h2>
          
        </div>
  
        {/* Ingredientes (solo para bebidas personalizadas) */}
        {item.ingredients?.length > 0 && (
          <div className="ingredients-section">
            <h3 className="ingredients-title">
              <span>Ingredientes</span>
            </h3>
            <ul className="ingredients-list">
              {item.ingredients.map((ingredient, idx) => (
                <li key={idx} className="ingredient-item">
                  <div className="ingredient-info">
                    {ingredient.image_url && (
                      <img 
                        src={ingredient.image_url} 
                        alt={ingredient.ingredient}
                        className="ingredient-image"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <span className="ingredient-name">{ingredient.ingredient}</span>
                  </div>
                  <span className="ingredient-amount">{ingredient.amount} ml</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ));
  };

  if (loading) return <div className="loading-message">Cargando pedidos...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!allOrders.length) return <div className="no-order-message">No se encontraron pedidos</div>;

  return (
    <div className="order-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaChevronLeft /> Volver
      </button>

      <h1 className="order-details-title">Historial de Pedidos</h1>

      <div className="toggle-completed">
        <label>
          <input 
            type="checkbox" 
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)} 
          />
          Mostrar pedidos finalizados
        </label>
      </div>

      <div className="orders-list">
        {filteredOrders.map((order) => {
          const statusId = statuses.find(s => s.name === order.status)?.id;
          const isCustom = order.custom_drink_id !== null;
          
          return (
            <div 
              key={order.orderid} 
              className={`order-card ${expandedOrder === order.orderid ? 'expanded' : ''}`}
            >
              <div className="order-header">
                <div className="order-meta">
                  <span className="order-id">
                    {isCustom ? `Bebida Personalizada ${order.custom_drink_id}` : `Pedido #${order.orderid}`}
                  </span>
                  <span className="order-date">{formatDateTime(order.date_time)}</span>
                  
                  {editingStatus === order.orderid ? (
                    <div className="status-edit-container">
                      <select
                        value={statusId}
                        onChange={(e) => handleStatusChange(order.orderid, e.target.value)}
                        className="status-select"
                      >
                        {statuses.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                      <button 
                        onClick={() => saveStatusChange(order.orderid)}
                        className="save-status-button"
                      >
                        <FaSave /> Guardar
                      </button>
                    </div>
                  ) : (
                    <span 
                      className={`order-status status-${order.status.toLowerCase().replace(/\s/g, '-')}`}
                      onClick={() => startEditing(order.orderid)}
                    >
                      {order.status}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => toggleOrderDetails(order.orderid)}
                  className="toggle-details-button"
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

              <div className={`order-content ${expandedOrder === order.orderid ? 'show' : ''}`}>
                {renderOrderContent(order)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
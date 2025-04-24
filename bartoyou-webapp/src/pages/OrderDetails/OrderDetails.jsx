import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronDown, FaChevronUp, FaSave } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Cargar pedidos
    fetch(`http://127.0.0.1:8000/api/orders/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error al obtener los pedidos");
        return response.json();
      })
      .then((data) => {
        setOrders(data);
        
        // Cargar estados disponibles
        return fetch("http://127.0.0.1:8000/api/bartoyou/order-statuses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then(response => {
        if (!response.ok) throw new Error("Error al obtener los estados");
        return response.json();
      })
      .then(data => {
        setStatuses(data.data || data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [userId]);

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
    setOrders(orders.map(order => 
      order.custom_drink_id === orderId ? { ...order, status_id: parseInt(newStatusId) } : order
    ));
  };

  const saveStatusChange = async (orderId) => {
    const token = localStorage.getItem("token");
    const orderToUpdate = orders.find(order => order.custom_drink_id === orderId);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderToUpdate.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status_id: orderToUpdate.status_id
        })
      });

      if (!response.ok) throw new Error("Error al actualizar el estado");

      const result = await response.json();
      if (result.success) {
        setEditingStatus(null);
        // Opcional: recargar los pedidos
        // fetchOrders();
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setError("Error al actualizar el estado: " + error.message);
      // Revertir cambios
      setOrders([...orders]);
    }
  };

  const startEditing = (orderId) => {
    setEditingStatus(orderId);
  };

  if (loading) return <div className="loading-message">Cargando pedidos...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!orders.length) return <div className="no-order-message">No se encontraron pedidos</div>;

  return (
    <div className="order-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaChevronLeft /> Volver
      </button>

      <h1 className="order-details-title">Historial de Pedidos</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div 
            key={order.custom_drink_id} 
            className={`order-card ${expandedOrder === order.custom_drink_id ? 'expanded' : ''}`}
          >
            <div className="order-header">
              <div className="order-meta">
                <span className="order-id">Pedido: {order.custom_drink_id}</span>
                <span className="order-date">{formatDateTime(order.date_time)}</span>
                
                {editingStatus === order.custom_drink_id ? (
                  <div className="status-edit-container">
                    <select
                      value={order.status_id}
                      onChange={(e) => handleStatusChange(order.custom_drink_id, e.target.value)}
                      className="status-select"
                    >
                      {statuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={() => saveStatusChange(order.custom_drink_id)}
                      className="save-status-button"
                    >
                      <FaSave />
                    </button>
                  </div>
                ) : (
                  <span 
                    className={`order-status status-${order.status.toLowerCase().replace(/\s/g, '-')}`}
                    onClick={() => startEditing(order.custom_drink_id)}
                  >
                    {statuses.find(s => s.id === order.status_id)?.name || order.status}
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => toggleOrderDetails(order.custom_drink_id)}
                className="toggle-details-button"
              >
                {expandedOrder === order.custom_drink_id ? (
                  <>
                    <FaChevronUp /> Ocultar
                  </>
                ) : (
                  <>
                    <FaChevronDown /> Ver ingredientes
                  </>
                )}
              </button>
            </div>

            <div className={`order-content ${expandedOrder === order.custom_drink_id ? 'show' : ''}`}>
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <h2 className="item-name">{item.name}</h2>
                  
                  <div className="ingredients-section">
                    <h3>Ingredientes:</h3>
                    <ul className="ingredients-list">
                      {item.ingredients?.map((ingredient, idx) => (
                        <li key={idx} className="ingredient-item">
                          <span className="ingredient-name">{ingredient.ingredient}</span>
                          <span className="ingredient-amount">{ingredient.amount} ml</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
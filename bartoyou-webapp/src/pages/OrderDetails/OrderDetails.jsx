import { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:8000/api/orders/user/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error al obtener los detalles");
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setOrderDetails(data.data);
        } else {
          throw new Error(data.message || "Pedido no encontrado");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [orderId]);

  const formatDateTime = (dateTime) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTime).toLocaleDateString('es-ES', options);
  };

  if (loading) return <div className="loading-message">Cargando detalles del pedido...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!orderDetails) return <div className="no-order-message">No se encontró el pedido</div>;

  return (
    <div className="order-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaChevronLeft /> Volver
      </button>

      <h1 className="order-details-title">Detalles del Pedido</h1>

      <div className="order-header">
        <div className="order-meta">
          <span className="order-id">Pedido: {orderDetails.custom_drink_id || `#${orderId}`}</span>
          <span className="order-date">{formatDateTime(orderDetails.date_time)}</span>
          <span className={`order-status status-${orderDetails.status.toLowerCase().replace(/\s/g, '-')}`}>
            {orderDetails.status}
          </span>
        </div>
      </div>

      <div className="order-content">
        {orderDetails.items?.map((item, index) => (
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
  );
}
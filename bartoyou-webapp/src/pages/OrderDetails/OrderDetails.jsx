import { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { userId } = useParams(); // Ahora solo recibimos userId
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

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
        // Si `data` tiene los pedidos, puedes filtrar por el `orderId` si es necesario
        const orderId = new URLSearchParams(window.location.search).get("orderId");

        if (orderId) {
          const foundOrder = data.find((order) => order.custom_drink_id === orderId);
          if (!foundOrder) throw new Error("Pedido no encontrado");
          setOrderDetails(foundOrder);
        } else {
          // Si no hay `orderId` en la URL, muestra todos los pedidos
          setOrderDetails(data);
        }
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

  if (loading) return <div className="loading-message">Cargando detalles del pedido...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!orderDetails) return <div className="no-order-message">No se encontró el pedido</div>;

  return (
    <div className="order-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaChevronLeft /> Volver
      </button>

      <h1 className="order-details-title">Detalles del Pedido</h1>

      {/* Si tienes varios pedidos, puedes listarlos */}
      {Array.isArray(orderDetails) ? (
        orderDetails.map((order) => (
          <div key={order.custom_drink_id} className="order-header">
            <div className="order-meta">
              <span className="order-id">Pedido: {order.custom_drink_id}</span>
              <span className="order-date">{formatDateTime(order.date_time)}</span>
              <span className={`order-status status-${order.status.toLowerCase().replace(/\s/g, "-")}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))
      ) : (
        // Si solo tienes un pedido específico, muestra los detalles de ese pedido
        <div className="order-header">
          <div className="order-meta">
            <span className="order-id">Pedido: {orderDetails.custom_drink_id}</span>
            <span className="order-date">{formatDateTime(orderDetails.date_time)}</span>
            <span className={`order-status status-${orderDetails.status.toLowerCase().replace(/\s/g, "-")}`}>
              {orderDetails.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

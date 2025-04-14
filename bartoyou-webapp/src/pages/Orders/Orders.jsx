import { useState, useEffect } from "react";
import { FaInfoCircle, FaSave } from "react-icons/fa";
import "./Orders.css";

const API_BASE = "http://127.0.0.1:8000/api/bartoyou";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await fetch(`${API_BASE}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ordersRes.ok) throw new Error("Error al obtener los pedidos");
        const ordersData = await ordersRes.json();
        setOrders(ordersData.data || ordersData);

        const statusesRes = await fetch(`${API_BASE}/order-statuses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statusesRes.ok) throw new Error("Error al obtener los estados");
        const statusesData = await statusesRes.json();
        setStatuses(statusesData.data || statusesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const formatDateTime = (dateTime) =>
    new Date(dateTime).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleStatusChange = (orderId, newStatusId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, status_id: parseInt(newStatusId) }
          : order
      )
    );
  };

  const saveStatusChange = async (orderId) => {
    const orderToUpdate = orders.find((o) => o.id === orderId);
    if (!orderToUpdate) return;

    const url = `${API_BASE}/orders/${orderId}`;
    console.log("Actualizando pedido en:", url);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          member_id: orderToUpdate.member_id,
          consumption_recipe_id: orderToUpdate.consumption_recipe_id,
          consumption_id: orderToUpdate.consumption_id,
          date_time: orderToUpdate.date_time,
          quantity: orderToUpdate.quantity,
          custom_drink_id: orderToUpdate.custom_drink_id,
          status_id: orderToUpdate.status_id,
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar el estado");

      const result = await response.json();
      if (result.success || response.status === 200) {
        setEditingStatus(null);
        alert("Estado actualizado correctamente");
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al actualizar el estado: " + err.message);
    }
  };

  const startEditing = (orderId) => setEditingStatus(orderId);

  return (
    <div className="orders-container">
      <h1 className="orders-title">Pedidos Recientes</h1>

      {loading ? (
        <p className="loading-message">Cargando pedidos...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : orders.length === 0 ? (
        <p className="no-orders-message">No hay pedidos registrados</p>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Bebida</th>
                <th>Fecha/Hora</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    {order.custom_drink_id
                      ? `Bebida Personalizada ${order.custom_drink_id}`
                      : `Bebida #${order.consumption_id || order.consumption_recipe_id}`}
                  </td>
                  <td>{formatDateTime(order.date_time)}</td>
                  <td>{order.quantity}</td>
                  <td>
                    {editingStatus === order.id ? (
                      <div className="status-edit-container">
                        <select
                          value={order.status_id}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className="status-select"
                        >
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveStatusChange(order.id)}
                          className="save-status-button"
                        >
                          <FaSave />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`status-badge status-${order.status_id}`}
                        onClick={() => startEditing(order.id)}
                      >
                        {
                          statuses.find((s) => s.id === order.status_id)?.name ||
                          `Estado ${order.status_id}`
                        }
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="details-button" onClick={() => {}}>
                      <FaInfoCircle /> Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

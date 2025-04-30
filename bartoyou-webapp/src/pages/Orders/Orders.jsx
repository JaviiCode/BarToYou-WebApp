import { useState, useEffect } from "react";
import { FaInfoCircle, FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./Orders.module.css";

const API_BASE = "http://127.0.0.1:8000/api/bartoyou";

export default function Orders() {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, statusesRes] = await Promise.all([
          fetch(`${API_BASE}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/order-statuses`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (!ordersRes.ok) throw new Error("Error al obtener los pedidos");
        if (!statusesRes.ok) throw new Error("Error al obtener los estados");

        const ordersData = await ordersRes.json();
        const statusesData = await statusesRes.json();

        setAllOrders(ordersData.data || ordersData);
        setStatuses(statusesData.data || statusesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const activeOrders = allOrders.filter(order => {
      return showCompleted ? true : order.status_id !== 3;
    });
    setFilteredOrders(activeOrders);
  }, [allOrders, showCompleted]);

  const formatDateTime = (dateTime) =>
    new Date(dateTime).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleStatusChange = (orderId, newStatusId) => {
    setAllOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status_id: parseInt(newStatusId) }
          : order
      )
    );
  };

  const saveStatusChange = async (orderId) => {
    const orderToUpdate = allOrders.find((o) => o.id === orderId);
    if (!orderToUpdate) return;

    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...orderToUpdate,
          status_id: orderToUpdate.status_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el estado");
      }

      const updatedOrders = allOrders.map(order => 
        order.id === orderId ? orderToUpdate : order
      );

      setAllOrders(updatedOrders);
      setEditingStatus(null);
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al actualizar el estado: " + err.message);
      setAllOrders([...allOrders]);
    }
  };

  const startEditing = (orderId) => setEditingStatus(orderId);

  return (
    <div className={styles.ordersContainer}>
      <h1 className={styles.ordersTitle}>Pedidos Recientes</h1>

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

      {loading ? (
        <p className={styles.loadingMessage}>Cargando pedidos...</p>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : filteredOrders.length === 0 ? (
        <p className={styles.noOrdersMessage}>No hay pedidos registrados</p>
      ) : (
        <div className={styles.ordersTableContainer}>
          <table className={styles.ordersTable}>
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
              {filteredOrders.map((order) => (
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
                      <div className={styles.statusEditContainer}>
                        <select
                          value={order.status_id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={styles.statusSelect}
                        >
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveStatusChange(order.id)}
                          className={styles.saveStatusButton}
                        >
                          <FaSave />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`${styles.statusBadge} ${styles[`status${order.status_id}`]}`}
                        onClick={() => startEditing(order.id)}
                      >
                        {statuses.find((s) => s.id === order.status_id)?.name ||
                          `Estado ${order.status_id}`}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.detailsButton}
                      onClick={() => {
                        const orderIdentifier = order.custom_drink_id?.replace("#", "") || order.id;
                        navigate(`/orders/${order.member_id}`);
                      }}
                    >
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
import { useState, useEffect } from "react";
import { FaChevronLeft, FaInfoCircle, FaSave, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./Orders.module.css";
import Alert from "../../components/Alert/Alert";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/bartoyou`;


export default function Orders() {
    const navigate = useNavigate();
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStatus, setEditingStatus] = useState(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        showCancel: false
    });

    const token = localStorage.getItem("token");

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
                showCustomAlert(
                    "Error",
                    err.message,
                    "error"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    useEffect(() => {
        let result = allOrders.filter(order => {
            return showCompleted ? true : order.status_id !== 3;
        });

        if (searchTerm) {
            const searchId = searchTerm.replace("#", "").trim();
            result = result.filter(order => {
                if (order.id.toString().includes(searchId)) return true;
                if (order.custom_drink_id) {
                    const drinkId = order.custom_drink_id.replace("#", "");
                    return drinkId.includes(searchId);
                }
                return false;
            });
        }

        setFilteredOrders(result);
    }, [allOrders, showCompleted, searchTerm]);

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

            showCustomAlert(
                "Éxito",
                "Estado del pedido actualizado correctamente",
                "success"
            );
        } catch (err) {
            console.error("Error al guardar:", err);
            showCustomAlert(
                "Error",
                "Error al actualizar el estado: " + err.message,
                "error"
            );
            setAllOrders([...allOrders]);
        }
    };

    const startEditing = (orderId) => setEditingStatus(orderId);

    return (
        <div className={styles.ordersContainer}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
                <FaChevronLeft /> Volver
            </button>


            <h1 className={styles.ordersTitle}>Pedidos Recientes</h1>

            <div className={styles.filtersContainer}>
                <div className={styles.searchContainer}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar por #ID o #Bebida..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

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
            </div>

            {loading ? (
                <p className={styles.loadingMessage}>Cargando pedidos...</p>
            ) : filteredOrders.length === 0 ? (
                <p className={styles.noOrdersMessage}>
                    {searchTerm ? "No hay pedidos que coincidan con la búsqueda" : "No hay pedidos registrados"}
                </p>
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
                                    <td>#{order.id}</td>
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
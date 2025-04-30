import { useState, useEffect } from 'react';
import { FaChevronLeft, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './ClientOrderDetails.module.css';

export default function ClientOrderDetails() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({}); // { orderId: boolean }
  const [expandedItems, setExpandedItems] = useState({}); // { orderId: { itemIndex: boolean } }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authData = JSON.parse(localStorage.getItem('authData'));
    const userId = authData?.user?.id;

    if (!userId || !token) {
      setError('No se encontró información del usuario');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/orders/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al obtener los pedidos');

        const data = await response.json();
        const filtered = data.filter(order => order.status !== 'Finalizado');
        setOrders(filtered);
        
        // Inicializar estados expandidos
        const initialExpandedOrders = {};
        const initialExpandedItems = {};
        
        filtered.forEach(order => {
          initialExpandedOrders[order.orderid] = false;
          initialExpandedItems[order.orderid] = {};
          order.items?.forEach((_, index) => {
            initialExpandedItems[order.orderid][index] = false;
          });
        });
        
        setExpandedOrders(initialExpandedOrders);
        setExpandedItems(initialExpandedItems);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const toggleItemDetails = (orderId, itemIndex) => {
    setExpandedItems(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [itemIndex]: !prev[orderId]?.[itemIndex]
      }
    }));
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar este pedido?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al cancelar el pedido');

      const result = await response.json();
      if (result.success) {
        setOrders(prev => prev.map(o =>
          o.orderid === orderId ? { ...o, status: 'Cancelado' } : o
        ));
        alert('Pedido cancelado exitosamente');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cancelar el pedido: ' + err.message);
    }
  };

  const getStatusPercentage = (status) => {
    const statusOrder = {
      'Pendiente': 0,
      'En preparación': 50,
      'Listo': 80,
      'Entregado': 100,
      'Cancelado': 0
    };
    return statusOrder[status] || 0;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Fecha no disponible';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTime).toLocaleDateString('es-ES', options);
  };

  if (loading) return <div className={styles.loadingMessage}>Cargando pedidos...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;
  if (!orders.length) return <div className={styles.noOrderMessage}>No se encontraron pedidos activos</div>;

  return (
    <div className={styles.clientOrderContainer}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <FaChevronLeft /> Volver
      </button>

      <h1 className={styles.title}>Pedidos Activos</h1>

      {orders.map(order => (
        <div key={order.orderid} className={styles.orderCard}>
          <div className={styles.orderHeader} onClick={() => toggleOrder(order.orderid)}>
            <div className={styles.orderIdStatus}>
              <span className={styles.orderId}>Pedido: {order.custom_drink_id}</span>
              <span className={`${styles.statusBadge} ${styles['status' + order.status.replace(/\s/g, '')]}`}>
                {order.status}
              </span>
            </div>
            <button className={styles.toggleOrderButton}>
              {expandedOrders[order.orderid] ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          {expandedOrders[order.orderid] && (
            <>
              <div className={styles.orderDate}>{formatDateTime(order.date_time)}</div>

              <div className={styles.progressTracker}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${getStatusPercentage(order.status)}%` }}
                  ></div>
                </div>
                <div className={styles.progressSteps}>
                  <div className={`${styles.step} ${getStatusPercentage(order.status) >= 0 ? styles.active : ''}`}>
                    <div className={styles.stepIcon}>1</div>
                    <div className={styles.stepLabel}>Pendiente</div>
                  </div>
                  <div className={`${styles.step} ${getStatusPercentage(order.status) >= 50 ? styles.active : ''}`}>
                    <div className={styles.stepIcon}>2</div>
                    <div className={styles.stepLabel}>En preparación</div>
                  </div>
                  <div className={`${styles.step} ${getStatusPercentage(order.status) >= 80 ? styles.active : ''}`}>
                    <div className={styles.stepIcon}>3</div>
                    <div className={styles.stepLabel}>Listo</div>
                  </div>
                  <div className={`${styles.step} ${getStatusPercentage(order.status) >= 100 ? styles.active : ''}`}>
                    <div className={styles.stepIcon}>4</div>
                    <div className={styles.stepLabel}>Entregado</div>
                  </div>
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items?.map((item, idx) => (
                  <div key={idx} className={styles.orderItem}>
                    <div 
                      className={styles.itemHeader}
                      onClick={() => toggleItemDetails(order.orderid, idx)}
                    >
                      <div className={styles.itemInfo}>
                        <h3>{item.name}</h3>
                        <button 
                          className={styles.toggleDetailsButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItemDetails(order.orderid, idx);
                          }}
                        >
                          {expandedItems[order.orderid]?.[idx] ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </button>
                      </div>
                    </div>

                    <div 
                      className={`${styles.itemDetails} ${expandedItems[order.orderid]?.[idx] ? styles.expanded : ''}`}
                    >
                      {item.image_url && (
                        <img
                          src={`http://127.0.0.1:8000${item.image_url}`}
                          alt={item.name}
                          className={styles.itemImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-drink.png';
                          }}
                        />
                      )}
                      
                      {item.description && (
                        <p className={styles.itemDescription}>{item.description}</p>
                      )}

                      {item.ingredients?.length > 0 && (
                        <div className={styles.ingredientsSection}>
                          <h4>Ingredientes:</h4>
                          <ul>
                            {item.ingredients.map((ing, i) => (
                              <li key={i}>
                                {ing.ingredient}: {ing.amount} ml
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order.status === 'Pendiente' && (
                <div className={styles.actionButtons}>
                  <button
                    onClick={() => handleCancelOrder(order.orderid)}
                    className={styles.cancelButton}
                  >
                    <FaTimes /> Cancelar Pedido
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import styles from './ConsumptionsPage.module.css';
import Alert from "../../components/Alert/Alert";
import { FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ConsumptionsPage = () => {
  const [consumptions, setConsumptions] = useState([]);
  const [filteredConsumptions, setFilteredConsumptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingConsumption, setEditingConsumption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    category_id: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: true
  });
  const itemsPerPage = 5;

  const navigate = useNavigate()

  const showCustomAlert = (title, message, type = 'info', onConfirm = null, showCancel = true) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm,
      showCancel
    });
    setShowAlert(true);
  };

  const getAuthToken = () => {
    const authData = localStorage.getItem('authData');
    return authData ? JSON.parse(authData).token : null;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchConsumptions = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bartoyou/consumptions`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('No autorizado - Por favor inicie sesión');
        throw new Error('Error al obtener las consumiciones');
      }

      const data = await response.json();
      setConsumptions(data.data);
      setFilteredConsumptions(data.data);
      setLoading(false);
    } catch (err) {
      showCustomAlert(
        'Error',
        err.message,
        'error'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumptions();
  }, []);

  useEffect(() => {
    const filtered = consumptions.filter(consumption =>
      consumption.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConsumptions(filtered);
    setCurrentPage(1);
  }, [searchTerm, consumptions]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(filteredConsumptions)
    ? filteredConsumptions.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  const totalPages = Math.ceil(
    Array.isArray(filteredConsumptions) ? filteredConsumptions.length / itemsPerPage : 1
  );

  const handleEdit = (consumption) => {
    setEditingConsumption(consumption);
    setFormData({
      name: consumption.name,
      image_url: consumption.image_url,
      category_id: consumption.category_id
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    showCustomAlert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta bebida? Esta acción no se puede deshacer.',
      'warning',
      async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bartoyou/consumptions/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });

          if (!response.ok) {
            throw new Error(response.status === 401 ?
              'No autorizado - Por favor inicie sesión' : 'Error al eliminar');
          }

          showCustomAlert(
            'Éxito',
            'Bebida eliminada correctamente',
            'success',
            fetchConsumptions,
            false
          );
        } catch (err) {
          showCustomAlert(
            'Error',
            err.message,
            'error'
          );
        }
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/bartoyou/consumptions/${editingConsumption.id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error(response.status === 401 ?
          'No autorizado - Por favor inicie sesión' : 'Error al actualizar');
      }

      showCustomAlert(
        'Éxito',
        'Bebida actualizada correctamente',
        'success',
        () => {
          fetchConsumptions();
          setIsModalOpen(false);
        },
        false
      );
    } catch (err) {
      showCustomAlert(
        'Error',
        err.message,
        'error'
      );
    }
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;

  return (
    <div className={styles.container}>
        
                    <button onClick={() => navigate(-1)} className={styles.backButton}>
                        <FaChevronLeft /> Volver
                    </button>
      <div className={styles.header}>
        <h1 className={styles.title}>Bebidas</h1>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Imagen</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(consumption => (
              <tr key={consumption.id}>
                <td>{consumption.name}</td>
                <td>
                  {consumption.image_url && (
                    <div className={styles.imagePreview}>
                      <img
                        src={consumption.image_url}
                        alt={consumption.name}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </td>
                <td>{consumption.category_id}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleEdit(consumption)}
                      className={styles.editButton}
                      aria-label="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(consumption.id)}
                      className={styles.deleteButton}
                      aria-label="Eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredConsumptions.length > itemsPerPage && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2>Editar Bebida</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nombre:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>URL de la imagen:</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>ID de categoría:</label>
                <input
                  type="number"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className={styles.saveButton}>
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        showCancel={alertConfig.showCancel}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type={alertConfig.type}
      />
    </div>
  );
};

export default ConsumptionsPage;

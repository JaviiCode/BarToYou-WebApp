import React, { useState } from 'react';
import styles from './AddDrinkForm.module.css';

const AddDrinkForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    image: null
  });
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const token = localStorage.getItem('token');

  const drinkCategories = [
    { id: 1, name: "Cócteles clásicos", description: "Mezclas creativas con alcohol" },
    { id: 2, name: "Cócteles sin alcohol", description: "Licores y bebidas espirituosas" },
    { id: 3, name: "Destilados y licores", description: "Refrescantes y sin alcohol" },
    { id: 4, name: "Cervezas", description: "Para después de comer" },
    { id: 5, name: "Vinos y espumantes", description: "Minerales y sabores" },
    { id: 6, name: "Bebidas calientes", description: "Naturales y recién exprimidos" },
    { id: 7, name: "Refrescos", description: "Naturales y recién exprimidos" },
    { id: 8, name: "Bebidas energéticas", description: "Cremosos y deliciosos" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setMessage({ text: 'Solo se permiten imágenes JPG, JPEG o PNG', type: 'error' });
        return;
      }

      // Validar tamaño (2MB máximo)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'La imagen no debe superar los 2MB', type: 'error' });
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Mostrar vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id || !formData.image) {
      setMessage({ text: 'Todos los campos son obligatorios', type: 'error' });
      return;
    }

    if (!token) {
      setMessage({ text: 'No estás autenticado. Por favor, inicia sesión.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('image', formData.image);

      const response = await fetch('http://127.0.0.1:8000/api/bartoyou/consumptions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      setMessage({ 
        text: data.message || 'Bebida añadida con éxito', 
        type: 'success' 
      });
      
      // Resetear formulario
      setFormData({
        name: '',
        category_id: '',
        image: null
      });
      setPreview('');
    } catch (error) {
      console.error('Error al añadir bebida:', error);
      setMessage({ 
        text: error.message || 'Error al enviar el formulario', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Añadir Nueva Bebida</h2>
      
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Nombre de la Bebida</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ej: Mojito, Coca-Cola, etc."
            required
            maxLength={100}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category_id" className={styles.label}>Categoría</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Selecciona una categoría</option>
            {drinkCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} - {category.description}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image" className={styles.label}>Imagen de la Bebida</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/jpeg, image/jpg, image/png"
            className={styles.fileInput}
            required
          />
          <small className={styles.fileHint}>Formatos aceptados: JPG, JPEG, PNG (Máx. 2MB)</small>
          {preview && (
            <div className={styles.previewContainer}>
              <img src={preview} alt="Vista previa" className={styles.previewImage} />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Añadiendo...' : 'Añadir Bebida'}
        </button>
      </form>
    </div>
  );
};

export default AddDrinkForm;
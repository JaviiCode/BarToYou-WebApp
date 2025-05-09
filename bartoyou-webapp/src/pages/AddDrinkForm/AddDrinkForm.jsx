import React, { useState } from 'react';
import styles from './AddDrinkForm.module.css';
import Alert from "../../components/Alert/Alert";
import { FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AddDrinkForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        image: null
    });
    const [preview, setPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info', // 'info', 'success', 'error'
        onConfirm: null,
        showCancel: false
    });

    const navigate = useNavigate()

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
                showCustomAlert(
                    'Error de formato',
                    'Solo se permiten imágenes JPG, JPEG o PNG',
                    'error'
                );
                return;
            }

            // Validar tamaño (2MB máximo)
            if (file.size > 2 * 1024 * 1024) {
                showCustomAlert(
                    'Error de tamaño',
                    'La imagen no debe superar los 2MB',
                    'error'
                );
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
            showCustomAlert(
                'Campos requeridos',
                'Todos los campos son obligatorios',
                'error'
            );
            return;
        }

        if (!token) {
            showCustomAlert(
                'Autenticación requerida',
                'No estás autenticado. Por favor, inicia sesión.',
                'error'
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category_id', formData.category_id);
            formDataToSend.append('image', formData.image);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bartoyou/consumptions`, {
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

            showCustomAlert(
                '¡Éxito!',
                data.message || 'Bebida añadida con éxito',
                'success',
                () => {
                    // Resetear formulario después de confirmar
                    setFormData({
                        name: '',
                        category_id: '',
                        image: null
                    });
                    setPreview('');
                }
            );
        } catch (error) {
            console.error('Error al añadir bebida:', error);
            showCustomAlert(
                'Error',
                error.message || 'Error al enviar el formulario',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
                <FaChevronLeft /> Volver
            </button>


            <h2 className={styles.title}>Añadir Nueva Bebida</h2>

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
};

export default AddDrinkForm;
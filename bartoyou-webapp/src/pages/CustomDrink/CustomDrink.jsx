import { useState, useEffect } from 'react';
import './CustomDrink.css';

const CustomDrink = () => {
  const [formData, setFormData] = useState({
    user_id: 1,
    base_drink: '',
    base_drink_id: null,
    ingredients: [],
    ice: false,
    ice_type: ''
  });

  const [previewData, setPreviewData] = useState(null);
  const [availableBases, setAvailableBases] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [basesRes, ingredientsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/bartoyou/consumptions', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('http://127.0.0.1:8000/api/bartoyou/ingredients', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);
        
        const basesData = await basesRes.json();
        const ingredientsData = await ingredientsRes.json();
        
        setAvailableBases(basesData.data);
        setAvailableIngredients(ingredientsData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error al cargar los datos. Por favor recarga la página.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Actualizar el preview cada vez que cambien los datos
    if (availableIngredients.length > 0) {
      setPreviewData({
        ...formData,
        ingredients: formData.ingredients.map(ing => ({
          ...ing,
          ingredient_name: availableIngredients.find(i => i.id === ing.ingredient_id)?.name || 'Desconocido',
          unit: availableIngredients.find(i => i.id === ing.ingredient_id)?.ingredient_unit || 'unidades'
        }))
      });
    }
  }, [formData, availableIngredients]);

  const handleBaseDrinkChange = (e) => {
    const selectedBase = availableBases.find(b => b.id === parseInt(e.target.value));
    setFormData({
      ...formData,
      base_drink: selectedBase?.name || '',
      base_drink_id: selectedBase?.id || null
    });
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        {
          consumption_id: 1, 
          ingredient_id: '',
          amount: '',
          unit: 'ml'
        }
      ]
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] = field === 'ingredient_id' || field === 'amount' ? 
      (field === 'amount' ? parseInt(value) || 0 : parseInt(value)) : value;
    
    // Actualizar la unidad automáticamente si cambia el ingrediente
    if (field === 'ingredient_id') {
      const selectedIngredient = availableIngredients.find(i => i.id === parseInt(value));
      if (selectedIngredient) {
        updatedIngredients[index].unit = selectedIngredient.ingredient_unit;
      }
    }

    setFormData({
      ...formData,
      ingredients: updatedIngredients
    });
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ingredients: updatedIngredients
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/custom-drink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error en la petición');

      const result = await response.json();
      alert('¡Bebida personalizada creada con éxito!');
      // Resetear el formulario después del éxito
      setFormData({
        ...formData,
        base_drink: '',
        base_drink_id: null,
        ingredients: [],
        ice: false,
        ice_type: ''
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la bebida. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="custom-drink-page">
        <h1 className="page-title">Crear Bebida Personalizada</h1>
        <div className="loading-message">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="custom-drink-page">
      <h1 className="page-title">Crear Bebida Personalizada</h1>
      
      <div className="form-container">
        <form onSubmit={handleSubmit} className="drink-form">
          <div className="form-group">
            <label>Bebida Base:</label>
            <select 
              value={formData.base_drink_id || ''}
              onChange={handleBaseDrinkChange}
              required
            >
              <option value="">Selecciona una base</option>
              {availableBases.map(base => (
                <option key={base.id} value={base.id}>{base.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ingredientes:</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <select
                  value={ingredient.ingredient_id || ''}
                  onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
                  required
                >
                  <option value="">Selecciona ingrediente</option>
                  {availableIngredients.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.stock} {ing.ingredient_unit} disponibles)</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={ingredient.amount || ''}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  min="1"
                  required
                />
                
                <span>{ingredient.unit}</span>
                
                <button 
                  type="button" 
                  onClick={() => handleRemoveIngredient(index)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={handleAddIngredient}
              className="add-ingredient-btn"
            >
              + Añadir Ingrediente
            </button>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.ice}
                onChange={(e) => setFormData({...formData, ice: e.target.checked})}
              />
              ¿Lleva hielo?
            </label>
          </div>

          {formData.ice && (
            <div className="form-group">
              <label>Tipo de hielo:</label>
              <select
                value={formData.ice_type}
                onChange={(e) => setFormData({...formData, ice_type: e.target.value})}
              >
                <option value="">Selecciona tipo</option>
                <option value="picado">Picado</option>
                <option value="cubos">Cubos</option>
                <option value="granizado">Granizado</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Crear Bebida'}
          </button>
        </form>

        <div className="preview-container">
          <h3>Resumen de tu bebida:</h3>
          {previewData ? (
            <div className="preview-content">
              <h4>{previewData.base_drink || 'Sin nombre'}</h4>
              
              {previewData.ingredients.length > 0 ? (
                <ul className="ingredients-list">
                  {previewData.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      {ing.amount} {ing.unit} de {ing.ingredient_name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay ingredientes añadidos</p>
              )}
              
              {previewData.ice && (
                <p>Hielo: {previewData.ice_type || 'No especificado'}</p>
              )}
            </div>
          ) : (
            <p>Comienza a añadir ingredientes para ver el preview</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDrink;
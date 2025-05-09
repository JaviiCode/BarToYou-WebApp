import { useState, useEffect } from "react";
import styles from "./CustomDrink.module.css";
import Alert from "../../components/Alert/Alert";

const CustomDrink = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    user_id: storedUser?.id || null,
    base_drink: "",
    base_drink_id: null,
    ingredients: [],
    ice: false,
    ice_type: "",
  });

  const [previewData, setPreviewData] = useState(null);
  const [availableBases, setAvailableBases] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: false
  });

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

  // Obtener datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [basesRes, ingredientsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/api/bartoyou/consumptions`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.REACT_APP_API_URL}/api/bartoyou/ingredients`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!basesRes.ok) throw new Error("Error al obtener bebidas base");
        if (!ingredientsRes.ok) throw new Error("Error al obtener ingredientes");

        const basesData = await basesRes.json();
        const ingredientsData = await ingredientsRes.json();

        setAvailableBases(basesData.data || []);
        setAvailableIngredients(ingredientsData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        showCustomAlert(
          "Error de carga",
          "Error al cargar los datos. Por favor recarga la página.",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (availableIngredients.length > 0) {
      setPreviewData({
        ...formData,
        ingredients: formData.ingredients.map((ing) => ({
          ...ing,
          ingredient_name:
            availableIngredients.find((i) => i.id === ing.ingredient_id)
              ?.name || "Desconocido",
          unit:
            availableIngredients.find((i) => i.id === ing.ingredient_id)
              ?.ingredient_unit || "unidades",
        })),
      });
    }
  }, [formData, availableIngredients]);

  const handleBaseDrinkChange = (e) => {
    const selectedBase = availableBases.find(
      (b) => b.id === parseInt(e.target.value)
    );
    setFormData({
      ...formData,
      base_drink: selectedBase?.name || "",
      base_drink_id: selectedBase?.id || null,
    });
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        {
          ingredient_id: null,
          amount: "",
          unit: "ml",
        },
      ],
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] =
      field === "ingredient_id" || field === "amount"
        ? field === "amount"
          ? parseInt(value) || 0
          : parseInt(value)
        : value;

    if (field === "ingredient_id") {
      const selectedIngredient = availableIngredients.find(
        (i) => i.id === parseInt(value)
      );
      if (selectedIngredient) {
        updatedIngredients[index].unit = selectedIngredient.ingredient_unit;
      }
    }

    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = formData.ingredients.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validación básica
    if (!formData.base_drink_id) {
      showCustomAlert(
        "Validación",
        "Debes seleccionar una bebida base",
        "error"
      );
      setIsSubmitting(false);
      return;
    }

    if (formData.ingredients.length === 0) {
      showCustomAlert(
        "Validación",
        "Debes añadir al menos un ingrediente",
        "error"
      );
      setIsSubmitting(false);
      return;
    }

    // Validar que todos los ingredientes tengan ID y cantidad válida
    const hasInvalidIngredients = formData.ingredients.some(
      ing => !ing.ingredient_id || ing.amount <= 0
    );

    if (hasInvalidIngredients) {
      showCustomAlert(
        "Validación",
        "Todos los ingredientes deben tener un elemento seleccionado y una cantidad válida",
        "error"
      );
      setIsSubmitting(false);
      return;
    }

    const cleanedIngredients = formData.ingredients.map(ing => ({
      ingredient_id: ing.ingredient_id,
      amount: ing.amount,
      unit: ing.unit
    }));

    const payload = {
      user_id: formData.user_id,
      base_drink_id: formData.base_drink_id,
      ingredients: cleanedIngredients,
      ice: formData.ice,
      ice_type: formData.ice_type
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/custom-drink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(responseText || "Respuesta no válida del servidor");
      }

      if (!response.ok) {
        throw new Error(result.message || "Error en la petición");
      }

      showCustomAlert(
        "¡Éxito!",
        `Bebida personalizada creada con ID ${result.custom_drink_id}`,
        "success",
        () => {
          // Resetear formulario
          setFormData({
            user_id: storedUser?.id || null,
            base_drink: "",
            base_drink_id: null,
            ingredients: [],
            ice: false,
            ice_type: "",
          });
        },
        false
      );
    } catch (error) {
      console.error("Error en el envío:", error);
      showCustomAlert(
        "Error",
        error.message || "Hubo un error al crear la bebida. Revisa los campos.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.customDrinkPage}>
        <h1 className={styles.pageTitle}>Crear Bebida Personalizada</h1>
        <div className={styles.loadingMessage}>Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className={styles.customDrinkPage}>
      <h1 className={styles.pageTitle}>Crear Bebida Personalizada</h1>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.drinkForm}>
          <div className={styles.formGroup}>
            <label>Bebida Base:</label>
            <select
              value={formData.base_drink_id || ""}
              onChange={handleBaseDrinkChange}
              required
            >
              <option value="">Selecciona una base</option>
              {availableBases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Ingredientes:</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className={styles.ingredientRow}>
                <select
                  value={ingredient.ingredient_id || ""}
                  onChange={(e) =>
                    handleIngredientChange(
                      index,
                      "ingredient_id",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">Selecciona ingrediente</option>
                  {availableIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.stock} {ing.ingredient_unit} disponibles)
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Cantidad"
                  value={ingredient.amount || ""}
                  onChange={(e) =>
                    handleIngredientChange(index, "amount", e.target.value)
                  }
                  min="1"
                  required
                />

                <span>{ingredient.unit}</span>

                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className={styles.removeBtn}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddIngredient}
              className={styles.addIngredientBtn}
            >
              + Añadir Ingrediente
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.ice}
                onChange={(e) =>
                  setFormData({ ...formData, ice: e.target.checked })
                }
              />
              ¿Lleva hielo?
            </label>
          </div>

          {formData.ice && (
            <div className={styles.formGroup}>
              <label>Tipo de hielo:</label>
              <select
                value={formData.ice_type}
                onChange={(e) =>
                  setFormData({ ...formData, ice_type: e.target.value })
                }
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
            className={styles.submitBtn} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Crear Bebida"}
          </button>
        </form>

        <div className={styles.previewContainer}>
          <h3>Resumen de tu bebida:</h3>
          {previewData ? (
            <div className={styles.previewContent}>
              <h4>{previewData.base_drink || "Sin nombre"}</h4>

              {previewData.ingredients.length > 0 ? (
                <ul className={styles.ingredientsList}>
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
                <p>Hielo: {previewData.ice_type || "No especificado"}</p>
              )}
            </div>
          ) : (
            <p>Comienza a añadir ingredientes para ver el preview</p>
          )}
        </div>
      </div>

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

export default CustomDrink;
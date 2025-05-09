import { useEffect, useState } from 'react';
import styles from './Alert.module.css';

const Alert = ({ 
  isOpen, 
  onClose, 
  title = "Alerta", 
  message, 
  confirmText = "Aceptar", 
  cancelText = "Cancelar", 
  onConfirm, 
  showCancel = true 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsExiting(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Tiempo de la animación
  };

  const handleConfirm = () => {
    setIsExiting(true);
    setTimeout(() => {
      onConfirm?.();
      onClose();
    }, 300);
  };

  if (!isOpen && !isExiting) return null;

  return (
    <div className={`${styles.alertOverlay} ${isExiting ? styles.alertExiting : ''}`}>
      <div className={`${styles.alertContainer} ${isExiting ? styles.alertContainerExiting : ''}`}>
        <div className={styles.alertHeader}>
          <h3 className={styles.alertTitle}>{title}</h3>
          <button className={styles.alertCloseButton} onClick={handleClose}>
            &times;
          </button>
        </div>
        <div className={styles.alertBody}>
          <p>{message}</p>
        </div>
        <div className={styles.alertFooter}>
          {showCancel && (
            <button 
              className={styles.alertButtonSecondary} 
              onClick={handleClose}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={styles.alertButtonPrimary} 
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
import React from 'react';

const DrinkCard = ({ drink }) => {
  // Estilos optimizados
  const styles = {
    card: {
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      marginBottom: '15px',
      border: '1px solid #f3f3f3',
      width: '280px', // Tamaño más compacto
      transform: 'translateY(0)',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
      }
    },
    imageContainer: {
      height: '160px', // Más pequeño
      overflow: 'hidden',
      position: 'relative',
      '&:after': {
        content: '""',
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '30%',
        background: 'linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 100%)'
      }
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      transition: 'transform 0.5s ease'
    },
    content: {
      padding: '15px'
    },
    title: {
      color: '#e53e3e',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '0.4rem',
      transition: 'color 0.3s ease'
    },
    description: {
      color: '#6b7280',
      fontSize: '0.9rem',
      lineHeight: '1.4',
      marginBottom: '10px'
    },
    price: {
      marginTop: '0.5rem',
      fontWeight: 'bold',
      fontSize: '0.95rem'
    },
    priceValue: {
      color: '#e53e3e',
      fontSize: '1.1rem'
    }
  };

  // Versión con hover funcional
  return (
    <div style={{
      ...styles.card,
      ':hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
      }
    }}>
      <div style={styles.imageContainer}>
        <img 
          src={drink.image_url} 
          alt={drink.name} 
          style={{
            ...styles.image,
            ':hover': {
              transform: 'scale(1.05)'
            }
          }}
        />
      </div>
      <div style={styles.content}>
        <h2 style={{
          ...styles.title,
          ':hover': {
            color: '#c53030'
          }
        }}>{drink.name}</h2>
        <p style={styles.description}>
          {drink.description || "Descripción del cóctel"}
        </p>
        {drink.price && (
          <div style={styles.price}>
            Precio: <span style={styles.priceValue}>${drink.price}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrinkCard;
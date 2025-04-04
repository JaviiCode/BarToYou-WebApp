import React from 'react';
import './CategoryCard.css';

const CategoryCard = ({ category, onClick }) => {
  return (
    <div className="category-card" onClick={onClick}>
      <div className="category-image-container">
        <img 
          src={category.image_url} 
          alt={category.name} 
          className="category-image"
        />
        <div className="category-overlay"></div>
      </div>
      <div className="category-content">
        <h3 className="category-title">{category.name}</h3>
        <p className="category-description">{category.description}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Card.css';

const Card = ({ title, icon, desc, path }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-card" onClick={() => navigate(path)}>
      <div className="card-header">
        <img src={icon} alt={title} className="card-icon-img" />
        <h3 className="card-title">{title}</h3>
      </div>
      <p className="card-desc">{desc}</p>
    </div>
  );
};

export default Card;

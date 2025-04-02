import React from 'react';
import Card from "../../components/Card/Card";
import './Dashboard.css';

// Importamos las imágenes desde assets/icons
import menuIcon from "../../assets/icons/menu.png";
import customIcon from "../../assets/icons/custom.png";

function Dashboard() {
  const cards = [
    { title: 'Menú', icon: menuIcon, desc: 'Escoge entre las decenas de bebidas que tenemos disponibles en nuestro bar. Hecha un ojo a la carta, pide lo que mas te guste y relajate hasta que te lo traigan !', path: '/Drinks' },
    { title: 'Bebida Personalizada', icon: customIcon, desc: 'Manages and displays important customer information', path: '/Client' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Brand You Agency</h1>
      </div>

      <div className="cards-container">
        {cards.map((card, index) => (
          <Card 
            key={index} 
            title={card.title} 
            icon={card.icon} 
            desc={card.desc} 
            path={card.path} 
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

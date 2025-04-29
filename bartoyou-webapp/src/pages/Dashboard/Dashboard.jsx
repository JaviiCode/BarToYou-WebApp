import React, { useEffect, useState } from 'react';
import Card from "../../components/Card/Card";
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

// Importamos las imágenes desde assets/icons
import menuIcon from "../../assets/icons/menu.png";
import customIcon from "../../assets/icons/custom.png";
// import ordersIcon from "../../assets/icons/orders.png";
// import adminIcon from "../../assets/icons/admin.png";
// import statsIcon from "../../assets/icons/stats.png";

function Dashboard() {
  const [cards, setCards] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuth = localStorage.getItem('authData');
    if (!storedAuth) {
      navigate('/login');
      return;
    }

    const authData = JSON.parse(storedAuth);
    const role = authData?.user?.role;
    setUserRole(role);

    // Cards para Cliente
    const clientCards = [
      {
        title: 'Menú',
        icon: menuIcon,
        desc: 'Escoge entre las decenas de bebidas que tenemos disponibles en nuestro bar. Hecha un ojo a la carta, pide lo que más te guste y relájate hasta que te lo traigan!',
        path: '/Drinks'
      },
      {
        title: 'Bebida Personalizada',
        icon: customIcon,
        desc: 'Saca tu lado más personal creando tu propia bebida, escoge entre la gran variedad de ingredientes que tenemos. Relájate y disfruta mientras nuestros camareros hacen tu deseo realidad.',
        path: '/CustomDrink'
      }
    ];

    // Cards para Camarero/Admin
    const staffCards = [
      {
        title: 'Listado de Pedidos',
        icon: customIcon,
        desc: 'Gestiona todos los pedidos activos del bar. Revisa el estado, marca como completado y lleva el control de lo que se está preparando.',
        path: '/Orders'
      },
    ];

    // Cards adicionales solo para Admin
    const adminCards = [
      {
        title: 'Estadísticas',
        icon: customIcon,
        desc: 'Accede a informes y análisis de ventas. Visualiza qué productos son más populares y toma decisiones basadas en datos.',
        path: '/Statistics'
      },
      {
        title: 'Administración',
        icon: customIcon,
        desc: 'Gestiona usuarios, roles y configuraciones del sistema. Área restringida solo para administradores.',
        path: '/Admin'
      },
      {
        title: 'Menú del Bar',
        icon: customIcon,
        desc: 'Administra la carta de bebidas disponibles. Añade nuevos productos, modifica existentes o actualiza precios.',
        path: '/BarMenu'
      }
    ];

    // Determinar qué cards mostrar según el rol
    if (role === 'Admin' || role === 'Administrador') {
      setCards([...staffCards, ...adminCards]);
    } else if (role === 'camarero') {
      setCards(staffCards);
    } else {
      setCards(clientCards);
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Brand You Agency</h1>
        <p className="user-role">Rol: {userRole?.toUpperCase() || 'No identificado'}</p>
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

import React, { useEffect, useState } from 'react';
import Card from "../../components/Card/Card";
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';

import menuIcon from "../../assets/icons/menu.png";
import customIcon from "../../assets/icons/custom.png";
import followOrder from "../../assets/icons/followOrder.png";
import addDrink from "../../assets/icons/addDrink.png";
import logs from "../../assets/icons/logs.png";

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
      },
      {
        title: 'Seguimiento del pedido',
        icon: followOrder,
        desc: 'Haz un seguimiento del pedido, mira todos sus detalles incluso ancelalo si te has decidido por otra bebida.',
        path: '/ClientOrderDetails'
      }
    ];

    const staffCards = [
      {
        title: 'Listado de Pedidos',
        icon: followOrder,
        desc: 'Gestiona todos los pedidos activos del bar. Revisa el estado, marca como completado y lleva el control de lo que se está preparando.',
        path: '/Orders'
      },
      {
        title: 'Creación de Bebidas',
        icon: addDrink,
        desc: 'Crea bebidas que se añadiran automaticamente al menú',
        path: '/AddDrinkForm'
      }
    ];

    const adminCards = [
      {
        title: 'Edita y elimina bebidas',
        icon: logs,
        desc: 'Edita y elimina bebidas',
        path: '/ConsumptionsPage'
      },
    ];

    if (role === 'Admin' || role === 'Administrador') {
      setCards([...staffCards, ...adminCards]);
    } else if (role === 'camarero') {
      setCards(staffCards);
    } else {
      setCards(clientCards);
    }
  }, [navigate]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>Bienvenido a BartoYou</h1>
      </div>

      <div className={styles.cardsContainer}>
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

import React from 'react';
import logo from '../assets/logo.png';

function Logo() {
    return (
        <div className="logo-container">
            <img src={logo} alt="BarToYou" className="img" />
        </div>
    );
}
export default Logo;

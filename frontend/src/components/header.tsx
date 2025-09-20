import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import "../styles/header.css"

function Header(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const email = localStorage.getItem('userEmail');
        setIsLoggedIn(!!token);
        setUserEmail(email || '');
    }, []);

    const handleUserClick = () => {
        if (isLoggedIn) {
            window.location.href = "/payments";
        } else {
            window.location.href = "/login";
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        setIsLoggedIn(false);
        setUserEmail('');
        window.location.href = "/";
    };

    return (
    <header>
        <div className="headerContainer">
            <div className="logoTitle">
<svg width="520" height="140" viewBox="0 0 520 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g2" x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
      <stop stop-color="#BFD4F2"/>
      <stop offset="1" stop-color="#A8D8E6"/>
    </linearGradient>
  </defs>

  <rect x="8" y="8" width="124" height="124" rx="28" fill="url(#g2)"/>
  <g transform="translate(0,0)" stroke="#111827" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
    {/* Foco */}
    <path d="M38 54c0-14 11-25 25-25s25 11 25 25c0 9-4 15-10 20v6a6 6 0 0 1-6 6H54a6 6 0 0 1-6-6v-6c-6-5-10-11-10-20z"/>
    <path d="M60 94h16"/>
    <path d="M58 102h20"/>

    <path d="M92 48c8 10 14 19 14 28 0 11-8 19-18 19s-18-8-18-19c0-9 6-18 14-28" />
  </g>
{/* Gota */}
  <text x="160" y="56" font-family="Inter, ui-sans-serif, system-ui" font-size="44" font-weight="800" fill="#111827">QuickPays</text>
  <text x="160" y="95" font-family="Inter, ui-sans-serif, system-ui" font-size="18" fill="#4B5B63">Pagos rápidos y claros para luz y agua</text>
</svg>

            </div>
            <div className="navBar">
                <nav>
                    <ul>
                        <li><Link to="/">Página principal</Link></li>
                        <li><Link to="/implement">Implementar QuickPay</Link></li>
                        <li><Link to="/about">Sobre nosotros</Link></li>
                        <li><Link to="/help">Ayuda</Link></li>
                    </ul>
                </nav>
            </div>
            
            {/* Usuario/Login Section */}
            <div className="userSection">
                <div className="userInfo" onClick={handleUserClick}>
                    <svg 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="userIcon"
                    >
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <div className="userText">
                        {isLoggedIn ? (
                            <div className="loggedInUser">
                                <span className="Name">{userEmail}</span>
                            </div>
                        ) : (
                            <div className="notLoggedUser">
                                <span className="loginText">Iniciar sesión</span>
                            </div>
                        )}
                    </div>
                </div>
                {isLoggedIn && (
                    <button className="logoutBtn" onClick={handleLogout} title="Cerrar sesión">
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                            <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    </header>
    );
}

export default Header;
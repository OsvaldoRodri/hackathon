import { Link } from 'react-router-dom';
import "../styles/header.css"

function Header(){
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
        </div>
    </header>
    );
}

export default Header;
import { Link } from 'react-router-dom';

function Header(){
    return (
    <header>
        <div className="headerContainer">
            <div className="logoTitle">
                <img src="logo.png" alt="Logo" />
                <h1>QuickPays</h1>
            </div>
            <div className="navBar">
                <nav>
                    <ul>
                        <li><Link to="#home">Pagina inicial</Link></li>
                        <li><Link to="#contact">Implementar QuickPay en mi localidad</Link></li>
                        <li><Link to="#about">Sobre nosotros</Link></li>
                        <li><Link to="#login">Necesito ayuda</Link></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>
    );
}

export default Header;
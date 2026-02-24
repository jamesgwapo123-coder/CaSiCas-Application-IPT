import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isLanding = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const navClass = `navbar ${isLanding ? 'dark' : ''} ${scrolled ? 'scrolled' : ''}`;

    return (
        <nav className={navClass}>
            <Link to="/" className="navbar-brand">CaSiCaS</Link>

            <button
                className="navbar-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                <li><Link to="/marketplace">Marketplace</Link></li>
                {user ? (
                    <>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li>
                            <button onClick={logout} className="btn btn-outline btn-sm">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                Get Started
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

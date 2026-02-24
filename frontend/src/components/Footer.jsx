import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <div className="footer-brand">CaSiCaS</div>
                        <p className="footer-desc">
                            The local marketplace for Cebu. Buy and sell items within your area
                            with geo-fenced listings. Safe, simple, and community-driven.
                        </p>
                    </div>
                    <div>
                        <h4>Navigate</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/marketplace">Marketplace</Link></li>
                            <li><Link to="/register">Get Started</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Categories</h4>
                        <ul className="footer-links">
                            <li><a href="/marketplace?category=electronics">Electronics</a></li>
                            <li><a href="/marketplace?category=furniture">Furniture</a></li>
                            <li><a href="/marketplace?category=vehicles">Vehicles</a></li>
                            <li><a href="/marketplace?category=services">Services</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© 2026 CaSiCaS. All rights reserved.</span>
                    <span>Cebu, Philippines</span>
                </div>
            </div>
        </footer>
    );
}

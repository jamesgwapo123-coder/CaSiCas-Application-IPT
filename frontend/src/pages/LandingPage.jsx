import { Link } from 'react-router-dom';
import { MapPin, Map, Users, Play, Target, Globe, Clock, ArrowRight } from '../components/Icons';
import Footer from '../components/Footer';

export default function LandingPage() {
    return (
        <>
            {/* HERO */}
            <section className="hero">
                <video
                    className="hero-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster=""
                >
                </video>
                <div className="hero-overlay"></div>

                <div className="hero-content" data-parallax="0.15">
                    <span className="hero-badge scroll-reveal">Cebu's Local Marketplace</span>
                    <h1 className="hero-title scroll-reveal">
                        Buy &amp; Sell<br />Locally
                    </h1>
                    <p className="hero-subtitle scroll-reveal">
                        Discover items near you. Post listings visible only to people in your area.
                        Geo-fenced for your community.
                    </p>
                    <div className="hero-cta scroll-reveal">
                        <Link to="/marketplace" className="btn btn-white btn-lg">
                            Explore Map
                        </Link>
                        <Link to="/register" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
                            Start Selling
                        </Link>
                    </div>
                </div>

                <div className="hero-scroll">
                    <span>Scroll</span>
                    <div className="hero-scroll-line"></div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="section">
                <div className="container">
                    <div className="section-header scroll-reveal">
                        <p className="section-label">How it works</p>
                        <h2 className="section-title">Your Neighborhood Marketplace</h2>
                        <p className="section-desc">
                            CaSiCaS connects buyers and sellers within your local area using geo-fenced listings on an interactive map.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card scroll-reveal" data-parallax="0.05">
                            <div className="feature-icon">
                                <Target size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Geo-Fenced</h3>
                            <p>
                                See listings only within your chosen radius. Set your area from
                                1km to 50km, or browse all of Cebu.
                            </p>
                        </div>
                        <div className="feature-card scroll-reveal" data-parallax="0.08">
                            <div className="feature-icon">
                                <Map size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Map View</h3>
                            <p>
                                Every listing is pinned on an interactive map. Click any marker
                                to preview the item instantly.
                            </p>
                        </div>
                        <div className="feature-card scroll-reveal" data-parallax="0.05">
                            <div className="feature-icon">
                                <Users size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Local Community</h3>
                            <p>
                                Built for Cebuanos. Meet nearby buyers and sellers for safe,
                                convenient transactions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="section section-dark">
                <div className="container">
                    <div className="section-header scroll-reveal">
                        <p className="section-label" style={{ color: 'rgba(255,255,255,0.5)' }}>CaSiCaS in Numbers</p>
                        <h2 className="section-title">Built for Cebu</h2>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-item scroll-reveal">
                            <h3>100+</h3>
                            <p>Active Listings</p>
                        </div>
                        <div className="stat-item scroll-reveal">
                            <h3>7</h3>
                            <p>Categories</p>
                        </div>
                        <div className="stat-item scroll-reveal">
                            <h3>50km</h3>
                            <p>Max Radius</p>
                        </div>
                        <div className="stat-item scroll-reveal">
                            <h3>24/7</h3>
                            <p>Always Available</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* VIDEO SECTION */}
            <section className="section section-alt">
                <div className="container">
                    <div className="section-header scroll-reveal">
                        <p className="section-label">See it in action</p>
                        <h2 className="section-title">How CaSiCaS Works</h2>
                        <p className="section-desc">
                            Watch how easy it is to post a listing and find items near you.
                        </p>
                    </div>
                    <div className="scroll-reveal" data-parallax="0.06" style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        aspectRatio: '16/9',
                        background: 'var(--color-bg-dark)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-light)',
                        fontSize: '1.2rem',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{ textAlign: 'center', zIndex: 1 }}>
                            <Play size={56} color="#fff" strokeWidth={1.2} />
                            <p style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', marginTop: '1rem' }}>
                                Demo Video Coming Soon
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="section-title scroll-reveal">Ready to Start?</h2>
                    <p className="section-desc scroll-reveal" style={{ marginBottom: 'var(--space-2xl)' }}>
                        Join CaSiCaS today and connect with buyers and sellers in your neighborhood.
                    </p>
                    <div className="scroll-reveal" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create Account
                        </Link>
                        <Link to="/marketplace" className="btn btn-outline btn-lg">
                            Browse Listings
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}

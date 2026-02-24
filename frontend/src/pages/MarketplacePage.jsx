import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import MapView from '../components/MapView';
import ListingForm from '../components/ListingForm';
import ChatPanel from '../components/ChatPanel';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Plus, MessageCircle } from '../components/Icons';

const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'food', label: 'Food' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' },
];

const CEBU_CENTER = { lat: 10.3157, lng: 123.8854 };

export default function MarketplacePage() {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');
    const [listingType, setListingType] = useState('');
    const [radius, setRadius] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);

    // Chat state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatListing, setChatListing] = useState(null);
    const [chatSellerId, setChatSellerId] = useState(null);

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;
            if (listingType) params.listing_type = listingType;
            if (radius > 0) {
                params.lat = CEBU_CENTER.lat;
                params.lng = CEBU_CENTER.lng;
                params.radius = radius;
            }
            const data = await api.getListings(params);
            setListings(data);
        } catch (err) {
            console.error('Failed to fetch listings:', err);
        } finally {
            setLoading(false);
        }
    }, [category, listingType, radius]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const handleMarkerClick = (listing) => {
        setSelectedListing(listing);
        const el = document.getElementById(`listing-${listing.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleListingCreated = () => {
        setShowForm(false);
        fetchListings();
    };

    const handleContactSeller = (listing) => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        setChatListing(listing);
        setChatSellerId(listing.seller);
        setChatOpen(true);
    };

    return (
        <div className="marketplace-layout">
            {/* MAP */}
            <div className="marketplace-map">
                <MapView
                    listings={listings}
                    onMarkerClick={handleMarkerClick}
                    radiusKm={radius > 0 ? radius : null}
                    centerCoords={[CEBU_CENTER.lng, CEBU_CENTER.lat]}
                />
            </div>

            {/* SIDE PANEL */}
            <div className="marketplace-panel">
                <div className="panel-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Listings
                            </h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                {listings.length} item{listings.length !== 1 ? 's' : ''} found
                                {radius > 0 ? ` within ${radius}km` : ' in all areas'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {user && (
                                <>
                                    <button className="btn btn-outline btn-sm" onClick={() => setChatOpen(true)}>
                                        <MessageCircle size={14} />
                                    </button>
                                    <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                                        <Plus size={14} /> Post
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="panel-filters">
                    <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        value={listingType}
                        onChange={(e) => setListingType(e.target.value)}
                    >
                        <option value="">Buy & Sell</option>
                        <option value="sell">For Sale</option>
                        <option value="buy">Want to Buy</option>
                    </select>

                    <div className="radius-control">
                        <input
                            type="range"
                            className="radius-slider"
                            min="0"
                            max="50"
                            step="1"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                        />
                        <span className="radius-value">
                            {radius === 0 ? 'All' : `${radius}km`}
                        </span>
                    </div>
                </div>

                {/* Listing Cards - 2 Column Grid */}
                <div className="panel-listings">
                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon"><Search size={40} /></div>
                            <h3>No Listings Found</h3>
                            <p>Try adjusting your filters or expanding your search radius.</p>
                        </div>
                    ) : (
                        <div className="panel-listings-grid">
                            {listings.map((listing) => (
                                <div
                                    key={listing.id}
                                    id={`listing-${listing.id}`}
                                    className={`product-card product-card-mini ${selectedListing?.id === listing.id ? 'selected' : ''}`}
                                    onClick={() => handleMarkerClick(listing)}
                                    style={selectedListing?.id === listing.id ? { borderColor: '#0a0a0a', boxShadow: '0 0 0 1px #0a0a0a' } : {}}
                                >
                                    {/* Card Image */}
                                    <div className="product-card-img">
                                        {(listing.image || listing.image_url) ? (
                                            <img src={listing.image || listing.image_url} alt={listing.title} />
                                        ) : (
                                            <div className="product-card-placeholder">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                            </div>
                                        )}
                                        <div className="product-card-badges">
                                            <span className={`listing-badge ${listing.listing_type === 'sell' ? 'badge-sell' : 'badge-buy'}`}>
                                                {listing.listing_type === 'sell' ? 'Sell' : 'Buy'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="product-card-body">
                                        <div className="product-card-price">{'\u20B1'}{Number(listing.price).toLocaleString()}</div>
                                        <h4 className="product-card-title">{listing.title}</h4>
                                        <div className="listing-meta">
                                            <span>{listing.category_display || listing.category}</span>
                                        </div>
                                        {/* Contact Seller */}
                                        {user && listing.seller_username !== user.username && (
                                            <button
                                                className="contact-seller-btn"
                                                onClick={(e) => { e.stopPropagation(); handleContactSeller(listing); }}
                                            >
                                                <MessageCircle size={10} /> Chat
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Listing Modal */}
            {showForm && (
                <ListingForm
                    onClose={() => setShowForm(false)}
                    onCreated={handleListingCreated}
                />
            )}

            {/* Chat Panel */}
            <ChatPanel
                isOpen={chatOpen}
                onClose={() => { setChatOpen(false); setChatListing(null); setChatSellerId(null); }}
                listing={chatListing}
                sellerId={chatSellerId}
            />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ListingForm from '../components/ListingForm';
import ChatPanel from '../components/ChatPanel';
import { ClipboardList, MessageCircle, MapPin, Plus, Edit, Trash } from '../components/Icons';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('listings');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    // Chat state
    const [chatOpen, setChatOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [convLoading, setConvLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) fetchMyListings();
    }, [user]);

    useEffect(() => {
        if (user && tab === 'messages') fetchConversations();
    }, [user, tab]);

    const fetchMyListings = async () => {
        setLoading(true);
        try {
            const data = await api.getMyListings();
            setListings(data);
        } catch (err) {
            console.error('Failed to fetch listings:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversations = async () => {
        setConvLoading(true);
        try {
            const data = await api.getConversations();
            setConversations(data);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setConvLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            await api.deleteListing(id);
            fetchMyListings();
        } catch (err) {
            alert('Failed to delete listing.');
        }
    };

    const handleEdit = (listing) => {
        setEditData(listing);
        setShowForm(true);
    };

    const handleCreated = () => {
        setShowForm(false);
        setEditData(null);
        fetchMyListings();
    };

    const openConversation = (convId) => {
        setChatOpen(true);
    };

    if (authLoading) {
        return (
            <div className="dashboard">
                <div className="container">
                    <div className="loading-spinner"><div className="spinner"></div></div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Dashboard
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
                            Welcome, {user.first_name || user.username} ({user.role})
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditData(null); setShowForm(true); }}>
                        <Plus size={16} /> New Listing
                    </button>
                </div>

                <div className="dashboard-tabs">
                    <button className={`dashboard-tab ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>
                        My Listings
                    </button>
                    <button className={`dashboard-tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>
                        Messages
                    </button>
                    <button className={`dashboard-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
                        Profile
                    </button>
                </div>

                {tab === 'listings' && (
                    <div>
                        {loading ? (
                            <div className="loading-spinner"><div className="spinner"></div></div>
                        ) : listings.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon"><ClipboardList size={40} /></div>
                                <h3>No Listings Yet</h3>
                                <p>Create your first listing to start selling or buying.</p>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setEditData(null); setShowForm(true); }}>
                                    Create Listing
                                </button>
                            </div>
                        ) : (
                            <div className="listings-grid">
                                {listings.map((listing) => (
                                    <div key={listing.id} className="product-card">
                                        {/* Card Image */}
                                        <div className="product-card-img">
                                            {(listing.image || listing.image_url) ? (
                                                <img src={listing.image || listing.image_url} alt={listing.title} />
                                            ) : (
                                                <div className="product-card-placeholder">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                                </div>
                                            )}
                                            {/* Badges overlaid on image */}
                                            <div className="product-card-badges">
                                                <span className={`listing-badge ${listing.listing_type === 'sell' ? 'badge-sell' : 'badge-buy'}`}>
                                                    {listing.listing_type === 'sell' ? 'Sell' : 'Buy'}
                                                </span>
                                                <span className="listing-badge" style={{
                                                    background: listing.status === 'active' ? 'var(--color-success)' : 'var(--color-text-muted)',
                                                    color: '#fff',
                                                }}>
                                                    {listing.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="product-card-body">
                                            <div className="product-card-price">{'\u20B1'}{Number(listing.price).toLocaleString()}</div>
                                            <h4 className="product-card-title">{listing.title}</h4>
                                            <p className="product-card-desc">{listing.description}</p>
                                            <div className="listing-meta" style={{ marginTop: 'auto' }}>
                                                <span>{listing.category_display || listing.category}</span>
                                                {listing.address && (
                                                    <><span>&middot;</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><MapPin size={10} /> {listing.address}</span></>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="product-card-actions">
                                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(listing)}>
                                                <Edit size={12} /> Edit
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(listing.id)}>
                                                <Trash size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MESSAGES */}
                {tab === 'messages' && (
                    <div>
                        {convLoading ? (
                            <div className="loading-spinner"><div className="spinner"></div></div>
                        ) : conversations.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon"><MessageCircle size={40} /></div>
                                <h3>No Messages Yet</h3>
                                <p>Start a conversation by contacting a seller on the marketplace.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        className="listing-card"
                                        onClick={() => { setChatOpen(true); }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ fontSize: '0.9rem' }}>
                                                    {conv.buyer_username === user.username ? conv.seller_username : conv.buyer_username}
                                                </strong>
                                                {conv.listing_title && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.75rem' }}>
                                                        {conv.listing_title}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.unread_count > 0 && (
                                                <span className="chat-unread">{conv.unread_count}</span>
                                            )}
                                        </div>
                                        {conv.last_message_text && (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                                {conv.last_message_text}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* PROFILE */}
                {tab === 'profile' && (
                    <div style={{ maxWidth: '500px' }}>
                        <div className="listing-card" style={{ cursor: 'default' }}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <span className="form-label">Username</span>
                                    <p style={{ fontWeight: 600 }}>{user.username}</p>
                                </div>
                                <div>
                                    <span className="form-label">Full Name</span>
                                    <p>{user.first_name} {user.last_name}</p>
                                </div>
                                <div>
                                    <span className="form-label">Email</span>
                                    <p>{user.email}</p>
                                </div>
                                <div>
                                    <span className="form-label">Role</span>
                                    <p style={{ textTransform: 'capitalize' }}>{user.role}</p>
                                </div>
                                <div>
                                    <span className="form-label">Member Since</span>
                                    <p>{new Date(user.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Listing Modal */}
            {showForm && (
                <ListingForm
                    onClose={() => { setShowForm(false); setEditData(null); }}
                    onCreated={handleCreated}
                    editData={editData}
                />
            )}

            {/* Chat Panel */}
            <ChatPanel
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
            />
        </div>
    );
}

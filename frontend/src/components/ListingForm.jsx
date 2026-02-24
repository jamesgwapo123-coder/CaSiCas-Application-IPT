import { useState, useRef } from 'react';
import api from '../api/client';
import { DollarSign, ShoppingCart, X } from '../components/Icons';

const CATEGORIES = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'food', label: 'Food' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' },
];

export default function ListingForm({ onClose, onCreated, editData }) {
    const [form, setForm] = useState(editData || {
        title: '',
        description: '',
        price: '',
        category: 'other',
        listing_type: 'sell',
        latitude: 10.3157,
        longitude: 123.8854,
        address: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(editData?.image || null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const cleanData = {};
            ['title', 'description', 'price', 'category', 'listing_type', 'latitude', 'longitude', 'address'].forEach(k => {
                if (form[k] !== undefined) cleanData[k] = form[k];
            });
            if (imageFile) cleanData.image = imageFile;

            if (editData?.id) {
                await api.updateListing(editData.id, cleanData);
            } else {
                await api.createListing(cleanData);
            }
            onCreated();
        } catch (err) {
            setError(err.message || 'Failed to save listing.');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{editData?.id ? 'Edit Listing' : 'New Listing'}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <div className="role-picker">
                            <div
                                className={`role-option ${form.listing_type === 'sell' ? 'selected' : ''}`}
                                onClick={() => setForm({ ...form, listing_type: 'sell' })}
                            >
                                <div className="role-icon"><DollarSign size={28} /></div>
                                <div className="role-label">Selling</div>
                            </div>
                            <div
                                className={`role-option ${form.listing_type === 'buy' ? 'selected' : ''}`}
                                onClick={() => setForm({ ...form, listing_type: 'buy' })}
                            >
                                <div className="role-icon"><ShoppingCart size={28} /></div>
                                <div className="role-label">Buying</div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input type="text" className="form-input" value={form.title} onChange={updateField('title')} required placeholder="e.g. iPhone 15 Pro - Like New" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" value={form.description} onChange={updateField('description')} required placeholder="Describe your item, condition, and meet-up preferences..." />
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">Photo</label>
                        {imagePreview ? (
                            <div className="image-preview-wrapper">
                                <img src={imagePreview} alt="Preview" className="image-preview" />
                                <button type="button" className="image-remove-btn" onClick={removeImage}>
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="image-drop-zone"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p>Click to add photo</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Price (₱)</label>
                            <input type="number" className="form-input" value={form.price} onChange={updateField('price')} required min="0" step="0.01" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={form.category} onChange={updateField('category')}>
                                {CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address / Location</label>
                        <input type="text" className="form-input" value={form.address} onChange={updateField('address')} placeholder="e.g. IT Park, Cebu City" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Latitude</label>
                            <input type="number" className="form-input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })} step="0.0001" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Longitude</label>
                            <input type="number" className="form-input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })} step="0.0001" required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Saving...' : (editData?.id ? 'Update Listing' : 'Post Listing')}
                    </button>
                </form>
            </div>
        </div>
    );
}

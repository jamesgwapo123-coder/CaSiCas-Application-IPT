/**
 * CaSiCaS API Client — Django REST Framework edition
 * All data goes through Django backend API.
 */

const API_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
    return localStorage.getItem('token');
}

function authHeaders(extra = {}) {
    const token = getToken();
    const headers = { ...extra };
    if (token) headers['Authorization'] = `Token ${token}`;
    return headers;
}

async function apiFetch(path, options = {}) {
    const url = `${API_URL}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: authHeaders(options.headers || {}),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || err.non_field_errors?.[0] || JSON.stringify(err));
    }
    if (res.status === 204) return null;
    return res.json();
}

// ──── Listings ────

export async function getListings(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters.listing_type && filters.listing_type !== 'all') params.set('listing_type', filters.listing_type);
    if (filters.lat) params.set('lat', filters.lat);
    if (filters.lng) params.set('lng', filters.lng);
    if (filters.radius) params.set('radius', filters.radius);

    const qs = params.toString();
    const data = await apiFetch(`/api/listings/${qs ? '?' + qs : ''}`);
    const results = data.results || data;

    return results.map((l) => ({
        ...l,
        seller_id: l.seller,
        seller_username: l.seller_username || 'Unknown',
        seller_rating: l.seller_rating || 0,
        seller_rating_count: l.seller_rating_count || 0,
        seller_avatar_url: l.seller_avatar_url || '',
        category_display: l.category_display || l.category?.charAt(0).toUpperCase() + l.category?.slice(1),
    }));
}

export async function getMyListings() {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    if (!profile.id) throw new Error('Not authenticated');
    return getListings({ seller_id: profile.id });
}

export async function createListing(listingData) {
    const formData = new FormData();
    formData.append('title', listingData.title);
    formData.append('description', listingData.description || '');
    formData.append('price', parseFloat(listingData.price));
    formData.append('category', listingData.category || 'other');
    formData.append('listing_type', listingData.listing_type || 'sell');
    formData.append('latitude', parseFloat(listingData.latitude));
    formData.append('longitude', parseFloat(listingData.longitude));
    formData.append('address', listingData.address || '');
    if (listingData.image_url) formData.append('image_url', listingData.image_url);
    if (listingData.image instanceof File) formData.append('image', listingData.image);

    const token = getToken();
    const res = await fetch(`${API_URL}/api/listings/`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Token ${token}` } : {},
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || JSON.stringify(err));
    }
    return res.json();
}

export async function updateListing(id, listingData) {
    const formData = new FormData();
    for (const [key, val] of Object.entries(listingData)) {
        if (val instanceof File) {
            formData.append(key, val);
        } else if (val !== undefined && val !== null) {
            formData.append(key, val);
        }
    }

    const token = getToken();
    const res = await fetch(`${API_URL}/api/listings/${id}/`, {
        method: 'PATCH',
        headers: token ? { 'Authorization': `Token ${token}` } : {},
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || JSON.stringify(err));
    }
    return res.json();
}

export async function deleteListing(id) {
    await apiFetch(`/api/listings/${id}/`, { method: 'DELETE' });
}

// ──── Messaging ────

export async function getConversations() {
    const data = await apiFetch('/api/messaging/conversations/');
    const results = data.results || data;
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');

    return results.map((conv) => {
        const other = conv.buyer === profile.id
            ? { id: conv.seller, username: conv.seller_username }
            : { id: conv.buyer, username: conv.buyer_username };

        return {
            id: conv.id,
            listing: conv.listing ? { id: conv.listing, title: conv.listing_title } : null,
            other_user: other,
            last_message: conv.last_message_text ? { text: conv.last_message_text, created_at: conv.last_message_time } : null,
            unread_count: conv.unread_count || 0,
            updated_at: conv.updated_at,
        };
    });
}

export async function getOrCreateConversation(listingId, sellerId) {
    const data = await apiFetch('/api/messaging/conversations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing: listingId, seller: sellerId }),
    });
    return data;
}

export async function getMessages(conversationId) {
    const data = await apiFetch(`/api/messaging/conversations/${conversationId}/messages/`);
    const results = data.results || data;
    return results.map((m) => ({
        ...m,
        sender_username: m.sender_username,
        reaction_summary: buildReactionSummary(m.reactions || []),
    }));
}

function buildReactionSummary(reactions) {
    const map = {};
    reactions.forEach((r) => {
        if (!map[r.emoji]) map[r.emoji] = 0;
        map[r.emoji]++;
    });
    return Object.entries(map).map(([emoji, count]) => ({ emoji, count }));
}

export async function sendMessage(conversationId, text) {
    return apiFetch(`/api/messaging/conversations/${conversationId}/send/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
}

export async function sendMessageWithImage(conversationId, text, imageFile) {
    const formData = new FormData();
    if (text) formData.append('text', text);
    if (imageFile) formData.append('image', imageFile);

    const token = getToken();
    const res = await fetch(`${API_URL}/api/messaging/conversations/${conversationId}/send/`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Token ${token}` } : {},
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || JSON.stringify(err));
    }
    return res.json();
}

export async function reactToMessage(conversationId, messageId, emoji) {
    return apiFetch(`/api/messaging/conversations/${conversationId}/react/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, emoji }),
    });
}

export async function markConversationRead(conversationId) {
    return apiFetch(`/api/messaging/conversations/${conversationId}/read/`, {
        method: 'POST',
    });
}

// ──── Profile ────

export async function getProfile() {
    return apiFetch('/api/auth/profile/');
}

export async function updateProfile(profileData) {
    return apiFetch('/api/auth/profile/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
    });
}

export async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = getToken();
    const res = await fetch(`${API_URL}/api/auth/profile/`, {
        method: 'PATCH',
        headers: token ? { 'Authorization': `Token ${token}` } : {},
        body: formData,
    });
    if (!res.ok) throw new Error('Avatar upload failed');
    const data = await res.json();
    return data.avatar_url;
}

// ──── Ratings ────

export async function rateSeller(listingId, sellerId, score, review = '') {
    return apiFetch('/api/ratings/rate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            listing: listingId,
            seller: sellerId,
            score,
            review,
        }),
    });
}

export async function getSellerRatings(sellerId) {
    const data = await apiFetch(`/api/ratings/seller/${sellerId}/`);
    return data.results || data;
}

// ──── Default export ────

const api = {
    getListings,
    getMyListings,
    createListing,
    updateListing,
    deleteListing,
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    sendMessageWithImage,
    reactToMessage,
    markConversationRead,
    getProfile,
    updateProfile,
    uploadAvatar,
    rateSeller,
    getSellerRatings,
};

export default api;

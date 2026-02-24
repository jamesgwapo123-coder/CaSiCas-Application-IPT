import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, DollarSign } from '../components/Icons';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        role: 'buyer',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.password_confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await register(form);
            navigate('/marketplace');
        } catch (err) {
            const firstError = Object.values(err).flat().find((v) => typeof v === 'string');
            setError(firstError || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Get Started</h2>
                <p className="subtitle">Create your CaSiCaS account</p>

                {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Role Picker */}
                    <div className="form-group">
                        <label className="form-label">I want to</label>
                        <div className="role-picker">
                            <div
                                className={`role-option ${form.role === 'buyer' ? 'selected' : ''}`}
                                onClick={() => setForm({ ...form, role: 'buyer' })}
                            >
                                <div className="role-icon">
                                    <ShoppingCart size={28} />
                                </div>
                                <div className="role-label">Buy</div>
                            </div>
                            <div
                                className={`role-option ${form.role === 'seller' ? 'selected' : ''}`}
                                onClick={() => setForm({ ...form, role: 'seller' })}
                            >
                                <div className="role-icon">
                                    <DollarSign size={28} />
                                </div>
                                <div className="role-label">Sell</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input type="text" className="form-input" value={form.first_name} onChange={updateField('first_name')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input type="text" className="form-input" value={form.last_name} onChange={updateField('last_name')} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input type="text" className="form-input" value={form.username} onChange={updateField('username')} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" value={form.email} onChange={updateField('email')} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" value={form.password} onChange={updateField('password')} required minLength={6} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" className="form-input" value={form.password_confirm} onChange={updateField('password_confirm')} required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

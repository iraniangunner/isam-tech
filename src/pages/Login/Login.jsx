import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const { login, user, loading } = useAuth();
    const navigate                 = useNavigate();

    const [form, setForm] = useState({
        email:    '',
        password: '',
    });
    const [error,       setError]       = useState('');
    const [submitting,  setSubmitting]  = useState(false);

    // ✅ If already logged in as admin — go straight to dashboard
    if (loading) return null;
    if (user && user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const data = await login(form.email, form.password);

            if (data.user.role !== 'admin') {
                setError('Access denied. Admins only.');
                return;
            }

            // ✅ Navigate after user is set
            navigate('/admin/dashboard', { replace: true });

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-header">
                    <div className="login-logo">🔐</div>
                    <h1>Admin Panel</h1>
                    <p>Sign in to your account</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                name="email"
                                placeholder="admin@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={submitting}
                    >
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
            await axios.post(`${apiBaseUrl}/auth/register`, {
                username: formData.username,
                password: formData.password
            });
            alert('Account created! Please login.');
            navigate('/login');
        } catch (err) {
            console.error('Signup Error:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Signup failed. Please try again.';
            alert(`Error: ${errorMessage}`);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-[80vh]">
            <div className="glass p-10 w-full max-w-md animate-fade">
                <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
                <form onSubmit={handleSignup}>
                    <div className="relative mb-4">
                        <UserIcon className="absolute left-3 top-3 text-text-muted" size={18} />
                        <input
                            className="input-field pl-10"
                            type="text"
                            placeholder="Username"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="relative mb-4">
                        <Mail className="absolute left-3 top-3 text-text-muted" size={18} />
                        <input
                            className="input-field pl-10"
                            type="email"
                            placeholder="Email Address"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="relative mb-6">
                        <Lock className="absolute left-3 top-3 text-text-muted" size={18} />
                        <input
                            className="input-field pl-10"
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full py-3">
                        Sign Up
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-text-muted">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;

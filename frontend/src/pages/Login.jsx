import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
            const res = await axios.post(`${apiBaseUrl}/auth/login`, new URLSearchParams({
                username: username,
                password: password
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const token = res.data.access_token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                username: username,
                email: username === 'admin' ? 'admin@veriscan.ai' : `${username}@gmail.com`,
                role: 'Premium Agent'
            }));
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-[80vh]">
            <div className="glass p-10 w-full max-w-md animate-fade">
                <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
                <form onSubmit={handleLogin}>
                    <div className="relative mb-4">
                        <UserIcon className="absolute left-3 top-3 text-text-muted" size={18} />
                        <input
                            className="input-field pl-10"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative mb-6">
                        <Lock className="absolute left-3 top-3 text-text-muted" size={18} />
                        <input
                            className="input-field pl-10"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full py-3">
                        Login
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-text-muted">
                    Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

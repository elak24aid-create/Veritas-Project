import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Shield } from 'lucide-react';
import axios from 'axios';
import { getApiBaseUrl } from '../config';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const apiBaseUrl = getApiBaseUrl();
            await axios.post(`${apiBaseUrl}/auth/register`, {
                username: formData.username,
                password: formData.password
            });
            alert('Account created successfully! Please login.');
            navigate('/login');
        } catch (err) {
            console.error('Signup Error:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Signup failed.';
            alert(`Notice: ${errorMessage}`);
            navigate('/login');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#0b1220]">
            <div className="card-dark p-8 w-full max-w-sm flex flex-col items-center border border-[#1f3156] shadow-2xl animate-fade">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3">
                    <Shield size={28} />
                </div>
                <h2 className="text-2xl font-black text-white text-center mb-1">Join TruthLens</h2>
                <p className="text-xs text-slate-400 text-center mb-6">Create Investigator Account</p>

                <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
                    <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                        <input
                            className="w-full bg-[#0d162a] border border-[#1e2f50] rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            type="text"
                            placeholder="Username"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                        <input
                            className="w-full bg-[#0d162a] border border-[#1e2f50] rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            type="email"
                            placeholder="Email Address"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                        <input
                            className="w-full bg-[#0d162a] border border-[#1e2f50] rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 rounded-xl mt-2 text-sm font-bold shadow-lg">
                        Create Account
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Already have an account? <Link to="/login" className="text-blue-400 font-semibold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;

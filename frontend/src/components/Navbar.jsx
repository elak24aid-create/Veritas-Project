import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="glass m-4 px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                <Shield size={28} />
                <span>Veritas</span>
            </Link>

            <div className="flex items-center gap-6">
                {token ? (
                    <>
                        <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium hover:text-red-400 transition-colors">
                            <LogOut size={18} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                        <Link to="/signup" className="btn btn-primary text-sm">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

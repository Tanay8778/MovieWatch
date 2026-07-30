import React, { useState } from 'react';
import { loginUser, registerUser } from '../appwrite';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await loginUser(email, password);
            } else {
                await registerUser(email, password, name);
                await loginUser(email, password); // Log them in right after register
            }
            // Trigger a re-fetch of the user state in App.jsx
            setUser(true); 
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="auth-container" style={{ padding: '2rem', color: 'white' }}>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
                {!isLogin && (
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                )}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: '1rem', background: 'transparent', color: 'gray' }}>
                {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
        </div>
    );
};

export default Auth;
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/character-select');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate('/character-select');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#f7f7f7] font-arcade">
            <div className="w-full max-w-md p-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl text-[#535353] mb-2 tracking-widest">JOIN THE RUN</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border-2 border-[#535353] p-8 shadow-[8px_8px_0px_0px_rgba(83,83,83,1)]">
                    <h2 className="text-xl mb-6 text-center text-[#535353] uppercase decoration-wavy underline">Register</h2>
                    {error && <div className="bg-[#535353] text-white p-2 mb-4 text-xs text-center border-2 border-dashed border-white">{error}</div>}

                    <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ENTER INITIALS"
                        required
                    />
                    <Input
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="PLAYER@EXAMPLE.COM"
                        type="email"
                        required
                    />
                    <Input
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="******"
                        type="password"
                        required
                    />

                    <div className="mt-8">
                        <Button type="submit" className="w-full">CREATE PLAYER</Button>
                    </div>

                    <div className="mt-6 text-center text-xs">
                        <Link to="/login" className="text-[#535353] hover:underline uppercase">Already have a coin?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

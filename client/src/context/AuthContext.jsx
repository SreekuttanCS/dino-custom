import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return data;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            const { data } = await API.post('/auth/register', { username, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return data;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const updateCharacter = async (formData) => {
        try {
            const { data } = await API.put('/users/character', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update local user state
            const updatedUser = { ...user, ...data };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            throw error;
        }
    }

    const updateUser = (data) => {
        const updatedUser = { ...user, ...data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateCharacter, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

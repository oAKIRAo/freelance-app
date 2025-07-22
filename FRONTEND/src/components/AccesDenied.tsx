import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '@/lib/decodeToken';
import '../styles/accessDenied.css';

export default function AccessDenied() {
    const navigate = useNavigate();
    const [homePath, setHomePath] = useState('/');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setHomePath('/');
            return;
        }
        const decoded = decodeToken(token);
        if (decoded?.role === 'freelancer') {
            setHomePath('/freelancer/home');
        } else {
            setHomePath('/');
        }
    }, []);

    const handleGoHome = () => {
        navigate(homePath);
    };

    return (
        <div className="access-denied-container">
            <h1 className="access-denied-title">403 - Access Denied</h1>
            <p className="access-denied-message">
                You don't have permission to access this page.
            </p>
            <button onClick={handleGoHome} className="access-denied-home-btn">
                Go to Home
            </button>
        </div>
    );
}

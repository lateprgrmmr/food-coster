import { Box, TextField, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../lib/api';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [login, { isLoading }] = useLoginMutation();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }
        try {
            const data = await login({ email, password }).unwrap();
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (error) {
            setError('Failed to login');
            console.error(error);
        }
    };

    return (
        <Box>
            <Typography variant="h1">Login</Typography>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} helperText={error} />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!error} helperText={error} />
            <Button variant="contained" color="primary" onClick={handleLogin} disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</Button>
            {error && <Typography variant="body1" color="error">{error}</Typography>}
        </Box>
    );
}
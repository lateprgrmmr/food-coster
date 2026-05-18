import { Box, TextField, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../lib/api';

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') ?? '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const handleSubmit = async () => {
        if (!token || !password) {
            setError('Token and new password are required');
            return;
        }
        try {
            await resetPassword({ token, password }).unwrap();
            navigate('/login');
        } catch {
            setError('Invalid or expired token. Please request a new one.');
        }
    };

    return (
        <Box>
            <Typography variant="h1">Reset Password</Typography>
            <TextField label="Reset Token" value={token} onChange={(e) => setToken(e.target.value)} error={!!error} />
            <TextField label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!error} helperText={error} />
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
        </Box>
    );
};

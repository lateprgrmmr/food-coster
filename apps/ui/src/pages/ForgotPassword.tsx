import { Box, TextField, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../lib/api';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const handleSubmit = async () => {
        if (!email) {
            setError('Email is required');
            return;
        }
        try {
            await forgotPassword({ email }).unwrap();
            setSubmitted(true);
        } catch {
            setError('Something went wrong. Please try again.');
        }
    };

    if (submitted) {
        return (
            <Box>
                <Typography variant="h1">Check the server console</Typography>
                <Typography variant="body1">If that email is registered, a reset token has been printed to the API server logs. Copy it and use it on the reset password page.</Typography>
                <Typography variant="body2"><Link to="/reset-password">Enter reset token</Link></Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h1">Forgot Password</Typography>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} helperText={error} />
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Token'}
            </Button>
            <Typography variant="body2"><Link to="/login">Back to login</Link></Typography>
        </Box>
    );
};
